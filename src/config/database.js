const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'walking_places',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      // PostGIS 확장을 위한 설정
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME + '_test' || 'walking_places_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    logging: false,
  }
};

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
  config[process.env.NODE_ENV || 'development'].database,
  config[process.env.NODE_ENV || 'development'].username,
  config[process.env.NODE_ENV || 'development'].password,
  config[process.env.NODE_ENV || 'development']
);

module.exports = { sequelize, config };
