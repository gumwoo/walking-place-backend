const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserTermAgreement = sequelize.define('UserTermAgreement', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '사용자 ID'
  },
  termId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '약관 ID'
  },
  agreedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '동의 시간'
  }
}, {
  tableName: 'user_term_agreements',
  timestamps: false,
  comment: '사용자 약관 동의 테이블',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['termId']
    },
    {
      fields: ['agreedAt']
    }
  ]
});

module.exports = UserTermAgreement;
