import { DataTypes, Model, Sequelize } from "sequelize";
import { DATA_SOURCES } from "../config/vars.config";

// Initialise Sequelize
const sequelize = new Sequelize(
  DATA_SOURCES.mySQL.DB_NAME,
  DATA_SOURCES.mySQL.DB_USER,
  DATA_SOURCES.mySQL.DB_PASSWORD,
  {
    host: DATA_SOURCES.mySQL.DB_HOST,
    dialect: "mysql",
  }
);

export class Page extends Model {}
export class PageContent extends Model {}
export class User extends Model {}
export class Token extends Model {}

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

Page.hasOne(PageContent, {
  foreignKey: {
    name: "pageID",
    allowNull: false,
    field: "page_id",
  },
});
PageContent.belongsTo(Page);
