import { DataTypes, Sequelize } from "sequelize/types";
import { DATA_SOURCES } from "../config/vars.config";

// Initialise Sequelize
const sequelize = new Sequelize(
  DATA_SOURCES.mySQL.DB_DATABASE,
  DATA_SOURCES.mySQL.DB_USER,
  DATA_SOURCES.mySQL.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

const Page = sequelize.define("Page", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
  },
});
