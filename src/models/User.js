const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  // OAuth 인증 (필수)
  oauth_provider: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['kakao', 'google']]
    }
  },
  oauth_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  // 반려견 정보 (모두 선택사항!)
  dog_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dog_breed: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dog_birth_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dog_size: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isIn: [['소형', '중형', '대형']]
    }
  },
  dog_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['oauth_provider', 'oauth_id']
    }
  ]
});

module.exports = User;
