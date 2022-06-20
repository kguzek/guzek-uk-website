CREATE DATABASE guzek_uk;
CREATE TABLE `guzek_uk`.`pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `url` VARCHAR(45) NOT NULL,
  `hidden` BOOLEAN NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `guzek_uk`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `hash` VARCHAR(256) NOT NULL,
  `salt` VARCHAR(45) NOT NULL,
  `admin` BOOLEAN NULL,
  PRIMARY KEY (`id`)
);