import { DataTypes, Model, Sequelize } from "sequelize";
import { DATA_SOURCES } from "../config/vars.config";

// Initialise Sequelize
const sequelize = new Sequelize(
  DATA_SOURCES.mySQL.DB_NAME,
  DATA_SOURCES.mySQL.DB_USER,
  DATA_SOURCES.mySQL.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
  }
);

export class Page extends Model {}

Page.init(
  {
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
  },
  {
    sequelize,
    modelName: "Page",
    timestamps: false,
    tableName: "pages",
  }
);
