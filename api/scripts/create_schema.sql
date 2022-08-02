CREATE DATABASE guzek_uk;
CREATE TABLE `guzek_uk`.`pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `url` VARCHAR(45) NOT NULL,
  `admin_only` BOOLEAN NOT NULL,
  `should_fetch` BOOLEAN NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `guzek_uk`.`page_content` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `page_id` INT NOT NULL,
  `content_en` TEXT NULL,
  `content_pl` TEXT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`)
);
CREATE TABLE `guzek_uk`.`users` (
  `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `modified_at` DATETIME NOT NULL,
  `hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(45) NOT NULL,
  `admin` BOOLEAN NULL,
  PRIMARY KEY (`uuid`)
);
CREATE TABLE `guzek_uk`.`tokens` (
  `value` VARCHAR(512) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`value`)
);
CREATE TABLE `guzek_uk`.`updated` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `endpoint` VARCHAR(32) NOT NULL,
  `timestamp` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
);