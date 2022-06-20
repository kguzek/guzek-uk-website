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
export class User extends Model {}

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

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
    tableName: "users",
  }
);
