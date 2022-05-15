import { createPool, Pool } from "mysql";
import { DATA_SOURCES } from "../config/vars.config";
import { getLogger } from "./logger";

const logger = getLogger(__filename);
const dataSource = DATA_SOURCES.mySqlDataSource;

let pool: Pool;

/** Generates a pool connection to be used throughout the app. */
export function initialiseDatabasePool() {
  try {
    pool = createPool({
      connectionLimit: dataSource.DB_CONNECTION_LIMIT,
      host: dataSource.DB_HOST,
      user: dataSource.DB_USER,
      password: dataSource.DB_PASSWORD,
      database: dataSource.DB_DATABASE,
    });
    logger.debug("MySql Adapter Pool generated successfully!");
  } catch (error) {
    const errorMessage = "Pool initialisation failed.";
    logger.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

/** Executes SQL queries in MySQL db
 *
 * @param {string} query - a valid SQL query
 * @param {string[] | Object} params - the parameterised values used in the query
 */
export function execute<T>(
  query: string,
  params: string[] | Object
): Promise<T> {
  try {
    if (!pool)
      throw new Error(
        "Pool was not created. Ensure pool is created when running the app."
      );

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  } catch (error) {
		const errorMessage = "Failed to execute MySQL query.";
    logger.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}
