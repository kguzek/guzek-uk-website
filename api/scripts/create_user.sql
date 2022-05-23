/**
 * Feel free to change the username as well as the password given to it
 */
CREATE USER 'guzek_uk_api' @'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
/* In an ideal world, we should strictly provide the grants the API has access
 * to a specific table rather than all the privileges.
 */
GRANT ALL PRIVILEGES ON `guzek_uk`.`*` TO 'guzek_uk_api' @'localhost';
FLUSH PRIVILEGES;