import { DataTypes, Model, Sequelize } from "sequelize";

const SESSION_INFO = {
  DB_HOST: process.env.MY_SQL_DB_HOST ?? "127.0.0.1",
  DB_PORT: process.env.MY_SQL_DB_PORT ?? "3306",
  DB_USER: process.env.MY_SQL_DB_USER ?? "root",
  DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD ?? "",
  DB_NAME: process.env.MY_SQL_DB_NAME ?? "database",
  DB_CONNECTION_LIMIT: parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT ?? "4"),
};

// Initialise Sequelize
const sequelize = new Sequelize(
  SESSION_INFO.DB_NAME,
  SESSION_INFO.DB_USER,
  SESSION_INFO.DB_PASSWORD,
  {
    host: SESSION_INFO.DB_HOST,
    dialect: "mysql",
  }
);

export class Page extends Model {}
export class PageContent extends Model {}
export class User extends Model {}
export class Token extends Model {}
export class Updated extends Model {}

Page.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adminOnly: {
      field: "admin_only",
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    shouldFetch: {
      field: "should_fetch",
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Page",
    timestamps: false,
    tableName: "pages",
  }
);

PageContent.init(
  {
    contentEN: {
      type: DataTypes.TEXT,
      field: "content_en",
    },
    contentPL: {
      type: DataTypes.TEXT,
      field: "content_pl",
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "PageContent",
    tableName: "page_content",
  }
);

User.init(
  {
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(36),
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
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    // Rename properties to match database columns
    createdAt: "created_at",
    updatedAt: "modified_at",
  }
);

Token.init(
  {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "Token",
    tableName: "tokens",
    // Rename properties to match database columns
    createdAt: "created_at",
    updatedAt: false,
  }
);

Updated.init(
  {
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Updated",
    tableName: "updated",
  }
);

const foreignKeyOptions = {
  foreignKey: {
    name: "pageID",
    allowNull: false,
    field: "page_id",
  },
};
Page.hasOne(PageContent, foreignKeyOptions);
PageContent.belongsTo(Page, foreignKeyOptions);
