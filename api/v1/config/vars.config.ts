const _connectionLimit = process.env.MY_SQL_DB_CONNECTION_LIMIT ?? "4";

export const DATA_SOURCES = {
  mySQL: {
    DB_HOST: process.env.MY_SQL_DB_HOST ?? "127.0.0.1",
    DB_PORT: process.env.MY_SQL_DB_PORT ?? "3306",
    DB_USER: process.env.MY_SQL_DB_USER ?? "root",
    DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD ?? "",
    DB_NAME: process.env.MY_SQL_DB_NAME ?? "database",
    DB_CONNECTION_LIMIT: parseInt(_connectionLimit),
  },
};
