-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2025 at 10:27 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dogum_gunu_sms`
--

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `birthday` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `errors`
--

CREATE TABLE `errors` (
  `id` int(11) NOT NULL,
  `error_message` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `errors`
--

INSERT INTO `errors` (`id`, `error_message`) VALUES
(-1000, 'SYSTEM_ERROR'),
(-31, 'Mesaj metni içerisinde yasaklı kelime kullanıldığı için başarısız'),
(-30, 'Kullanıcının API kullanım yetkisi aktif değil'),
(-28, 'Kullanıcı gönderim limiti aşıldı'),
(-27, 'Taahhüt miktarı aşıldı.'),
(-26, 'Taahhüt süresi zaman aşımına uğradı.'),
(-25, 'Belirtilen Id için onaylanmamış bir paket bulunamadı.'),
(-24, 'Belirtilen paket zaten onaylanmıştır.'),
(-23, 'Kullanıcı yetkisi bulunmamaktadır.'),
(-22, 'Yetkisiz IP Adresi'),
(-21, 'Numara karalistede'),
(-20, 'Bilgilendirme mesajı almak istemiyor'),
(-19, 'Mükerrer gönderim isteği'),
(-18, 'Gönderim içerisinde birden fazla hata mevcut. MessageId kontrol edilmelidir.'),
(-17, 'Parametre adetleri ile şablon içerisindeki parametre adedi uyuşmuyor'),
(-16, 'Geçersiz alıcı bilgisi'),
(-15, 'Mesaj içeriği boş veya limit olan karakter sayısını aşıyor'),
(-14, 'Hesaba ait SMS gönderim yetkisi bulunmuyor'),
(-13, 'Geçersiz gönderici bilgisi'),
(-12, 'Bitiş tarihi ile şu an ki zaman arasındaki fark 30 günden fazla.'),
(-11, 'Başlangıç tarihi ile şu an ki zaman arasındaki fark 30 dakikadan az.'),
(-10, 'Operatör servisinde geçici kesinti'),
(-9, 'Prepaid hesap bulunamadı'),
(-8, 'Alınan parametrelerden biri veya birkaçı hatalı'),
(-7, 'Hatalı xml istek yapısı.'),
(-6, 'Kayıt bulunamadı.'),
(-5, 'Kullanıcı hesabı pasif durumda'),
(-4, 'Kullanıcı hesabı bulunamadı'),
(-3, 'Kullanıcı bloke durumda'),
(-2, 'Kullanıcı pasif durumda'),
(-1, 'Girilen bilgilere sahip bir kullanıcı bulunamadı'),
(0, 'No error');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('SCHEDULE_TIME', '10:00'),
('SMS_ACCOUNTID', 'your_id'),
('SMS_ORIGINATOR', 'your_originator'),
('SMS_PASSWORD', 'your_password'),
('SMS_URL', 'your_url'),
('SMS_USERCODE', 'your_usercode'),
('SMS_USERNAME', 'your_username');

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL,
  `error_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `status` enum('success','failed') NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- Indexes for table `errors`
--
ALTER TABLE `errors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `error_id` (`error_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sms_logs_ibfk_2` FOREIGN KEY (`error_id`) REFERENCES `errors` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
