/**
 * Feel free to change the username as well as the password given to it
 */
CREATE USER 'guzek_uk_api' @'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
/* In an ideal world, we should strictly provide the grants the API has access
 * to a specific table rather than all the privileges.
 */
-- On some machines the underscore in `guzek_uk` needs to be escaped with a backslash,
-- otherwise the user will not be able to access the database
-- https://stackoverflow.com/a/44917370/15757366
GRANT ALL PRIVILEGES ON `guzek\_uk`.`*` TO 'guzek_uk_api' @'localhost';
FLUSH PRIVILEGES;