// scripts/syncDatabase.js
const { sequelize } = require('../config/database');
const Walk = require('../models/Walk');

const syncDatabase = async () => {
  try {
    console.log('🟡 syncDatabase.js 시작');

    await sequelize.authenticate();
    console.log('🟢 DB 연결 성공');

    await sequelize.sync({ alter: true });
    console.log('✅ 모든 테이블 동기화 완료');
  } catch (err) {
    console.error('❌ DB 동기화 실패:', err);
  }
};

syncDatabase();
