require("dotenv").config();
const mysql = require("mysql2/promise");
const cron = require("node-cron");
const axios = require("axios");
const xmlJs = require("xml-js");

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
                <Username>${process.env.SMS_USERNAME}</Username>
                <Password>${process.env.SMS_PASSWORD}</Password>
                <UserCode>${process.env.SMS_USERCODE}</UserCode>
                <AccountId>${process.env.SMS_ACCOUNTID}</AccountId>
                <Originator>${process.env.SMS_ORIGINATOR}</Originator>
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

  try {
    const response = await axios.post(process.env.SMS_URL, xmlBody, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "https://webservice.asistiletisim.com.tr/SmsProxy/sendSms",
      },
    });

    const resultJson = xmlJs.xml2js(response.data, { compact: true });
    const errorCode =
      resultJson["soap:Envelope"]["soap:Body"]["sendSmsResponse"][
        "sendSmsResult"
      ]["ErrorCode"]["_text"];

    return { success: errorCode === "0", errorCode: parseInt(errorCode) };
  } catch (error) {
    console.error(`SMS API'ye istek sırasında hata:`, error.message);
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

const scheduleTime = process.env.SCHEDULE_TIME || "10:00";
const [hour, minute] = scheduleTime.split(":");
const cronExpression = `${minute} ${hour} * * *`;

cron.schedule(cronExpression, dogumGunuSmsGonder, {
  timezone: "Europe/Istanbul",
});

console.log(`Çalışma Zamanı: Her gün ${scheduleTime} olarak ayarlandı.`);
console.log("Servis çalışıyor...");
