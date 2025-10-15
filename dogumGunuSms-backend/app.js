require("dotenv").config();
const mysql = require("mysql2/promise");
const cron = require("node-cron");
const axios = require("axios");
const xmlJs = require("xml-js");
const express = require("express");
const cors = require("cors");
const { encrypt, decrypt } = require('./utils/crypto');

let scheduledTask;

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/api/stats", async (req, res) => {
  try {
    const [[{ total_employees }]] = await pool.query(
      "SELECT COUNT(*) as total_employees FROM employees"
    );
    const [[{ success_sms }]] = await pool.query(
      "SELECT COUNT(*) as success_sms FROM sms_logs WHERE status = 'success'"
    );
    const [[{ failed_sms }]] = await pool.query(
      "SELECT COUNT(*) as failed_sms FROM sms_logs WHERE status = 'failed'"
    );
    res.json({ total_employees, success_sms, failed_sms });
  } catch (error) {
    res.status(500).json({ message: "İstatistikler alınamadı." });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const [employees] = await pool.query(
      "SELECT *, TIMESTAMPDIFF(YEAR, birthday, CURDATE()) AS age FROM employees ORDER BY id DESC"
    );
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Çalışanlar getirilirken hata oluştu." });
  }
});

app.get("/api/sms_logs/success", async (req, res) => {
  try {
    const query = `
            SELECT sl.id, sl.message_text, sl.sent_at, e.name as employee_name, e.phone_number
            FROM sms_logs sl
            JOIN employees e ON sl.employee_id = e.id
            WHERE sl.status = 'success'
            ORDER BY sl.id DESC
        `;
    const [logs] = await pool.query(query);
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Başarılı SMS logları getirilirken hata oluştu." });
  }
});

app.get("/api/sms_logs/failed", async (req, res) => {
  try {
    const query = `
            SELECT sl.id, sl.message_text, sl.sent_at, sl.error_id, 
                   e.name as employee_name, e.phone_number,
                   err.error_message
            FROM sms_logs sl
            JOIN employees e ON sl.employee_id = e.id
            LEFT JOIN errors err ON sl.error_id = err.id
            WHERE sl.status = 'failed'
            ORDER BY sl.id DESC
        `;
    const [logs] = await pool.query(query);
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Başarısız SMS logları getirilirken hata oluştu." });
  }
});

// Ayarlar ile alakali islemler sifrelenerek yapildi

app.get("/api/settings", async (req, res) => {
    try {
        const [settingsRows] = await pool.query("SELECT * FROM settings");

        const settings = settingsRows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        const fieldsToDecrypt = [
            'SMS_USERNAME',
            'SMS_PASSWORD',
            'SMS_USERCODE',
            'SMS_ACCOUNTID',
            'SMS_ORIGINATOR',
            'SMS_URL'
        ];

        for (const key of fieldsToDecrypt) {
            if (settings[key]) {
                settings[key] = decrypt(settings[key]);
            }
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Ayarlar getirilirken hata oluştu." });
    }
});

app.put("/api/settings", async (req, res) => {
    const newSettings = req.body;
    const connection = await pool.getConnection();
    const fieldsToEncrypt = ['SMS_USERNAME', 'SMS_PASSWORD', 'SMS_USERCODE', 'SMS_ACCOUNTID', 'SMS_ORIGINATOR', 'SMS_URL'];
    try {
        await connection.beginTransaction();
        for (const key in newSettings) {
            if (Object.hasOwnProperty.call(newSettings, key)) {
                let value = newSettings[key];
                if (fieldsToEncrypt.includes(key)) {
                    value = encrypt(value);
                }
                await connection.execute("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [value, key]);
            }
        }
        await connection.commit();

        await setupCronJob();

        res.json({ message: "Ayarlar başarıyla güncellendi." });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Ayarlar güncellenirken bir hata oluştu." });
    } finally {
        connection.release();
    }
});

async function dogumGunuKontrolEt() {
  try {
    const query = `
      SELECT id, name, phone_number FROM employees
      WHERE MONTH(birthday) = MONTH(CURDATE()) AND DAY(birthday) = DAY(CURDATE());
    `;

    const [employees] = await pool.query(query);

    if (employees.length > 0) {
      console.log(`\nDoğum günü bugün olan ${employees.length} kişi bulundu.`);
    } else {
      console.log("\nDoğum günü bugün olan kimse bulunamadı.");
    }

    return employees;
  } catch (error) {
    console.error(
      "Doğum günü kontrol veritabanı sorgu sırasında hata oluştu:",
      error.message
    );
    return [];
  }
}

async function smsGonder(phoneNumber, message) {
    try {
        const [settingsRows] = await pool.query("SELECT * FROM settings");
        const settings = settingsRows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        const fieldsToDecrypt = ['SMS_USERNAME', 'SMS_PASSWORD', 'SMS_USERCODE', 'SMS_ACCOUNTID', 'SMS_ORIGINATOR', 'SMS_URL'];
        for (const key of fieldsToDecrypt) {
            if (settings[key]) {
                settings[key] = decrypt(settings[key]);
            }
        }

        let formattedPhoneNumber = phoneNumber;
        if (formattedPhoneNumber.startsWith("0")) {
            formattedPhoneNumber = "90" + formattedPhoneNumber.substring(1);
        } else if (!formattedPhoneNumber.startsWith("90")) {
            formattedPhoneNumber = "90" + formattedPhoneNumber;
        }

        const xmlBody = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="https://webservice.asistiletisim.com.tr/SmsProxy">
        <soap:Header/>
        <soap:Body>
          <sendSms>
            <requestXml>
              <![CDATA[
              <SendSms>
                  <Username>${settings.SMS_USERNAME}</Username>
                  <Password>${settings.SMS_PASSWORD}</Password>
                  <UserCode>${settings.SMS_USERCODE}</UserCode>
                  <AccountId>${settings.SMS_ACCOUNTID}</AccountId>
                  <Originator>${settings.SMS_ORIGINATOR}</Originator>
                  <SendDate></SendDate>
                  <ValidityPeriod>60</ValidityPeriod>
                  <MessageText>${message}</MessageText>
                  <IsCheckBlackList>0</IsCheckBlackList>
                  <IsEncryptedParameter>0</IsEncryptedParameter>
                  <ReceiverList><Receiver>${formattedPhoneNumber}</Receiver></ReceiverList>
              </SendSms>
              ]]>
            </requestXml>
          </sendSms>
        </soap:Body>
      </soap:Envelope>`;

        const response = await axios.post(settings.SMS_URL, xmlBody, {
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "https://webservice.asistiletisim.com.tr/SmsProxy/sendSms",
            },
        });

        const resultJson = xmlJs.xml2js(response.data, { compact: true });
        const errorCode = resultJson["soap:Envelope"]["soap:Body"]["sendSmsResponse"]["sendSmsResult"]["ErrorCode"]["_text"];
        return { success: errorCode === "0", errorCode: parseInt(errorCode) };

    } catch (error) {
        console.error(`SMS gönderme işlemi sırasında bir hata oluştu:`, error.message);
        return { success: false, errorCode: -9999 };
    }
}

async function logToDb(employeeId, message, status, errorCode) {
  const query = `
    INSERT INTO sms_logs (employee_id, message_text, status, error_id)
    VALUES (?, ?, ?, ?)
  `;
  try {
    await pool.execute(query, [employeeId, message, status, errorCode]);
  } catch (dbError) {
    console.error("Veritabanına log yazma hatası:", dbError.message);
  }
}

async function dogumGunuSmsGonder() {
  const bugun = new Date().toLocaleString("tr-TR");
  console.log(`Görev başlatıldı: ${bugun}`);

  const employeesToSend = await dogumGunuKontrolEt();

  if (employeesToSend.length === 0) return;

  for (const employee of employeesToSend) {
    console.log(`SMS işleniyor: ${employee.name}`);
    const message = `Sevgili ${employee.name}, doğum günün kutlu olsun!`;

    const result = await smsGonder(employee.phone_number, message);

    const status = result.success ? "success" : "failed";
    await logToDb(employee.id, message, status, result.errorCode);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    `Görev tamamlandi. Toplam ${employeesToSend.length} kişiye sms işlendi.`
  );
}

async function setupCronJob() {
    try {
        if (scheduledTask) {
            scheduledTask.stop();
            console.log('Eski zamanlayıcı durduruldu.');
        }

        const [[scheduleSetting]] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'SCHEDULE_TIME'");
        const scheduleTime = scheduleSetting ? scheduleSetting.setting_value : '10:00';

        const [hour, minute] = scheduleTime.split(":");
        const cronExpression = `${minute} ${hour} * * *`;

        scheduledTask = cron.schedule(cronExpression, dogumGunuSmsGonder, {
            timezone: "Europe/Istanbul",
        });

        console.log(`Zamanlayıcı kuruldu: Her gün ${scheduleTime}`);
    } catch (error) {
        console.error("Zamanlayıcı kurulurken bir hata oluştu:", error.message);
    }
}

async function startServer() {
    await setupCronJob();

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`${PORT} adresinde çalışıyor.`);
    });
}

startServer();
