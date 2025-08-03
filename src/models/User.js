const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: '사용자 고유 ID',
    field: 'user_id'
  },
  
  // OAuth 인증 (필수)
  oauth_provider: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'OAuth 제공업체 (kakao, google 등)'
  },
  oauth_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'OAuth 제공업체에서 제공하는 사용자 고유 ID'
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
  
  // 선호 위치 정보
  preferred_location_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'locations',
      key: 'id'
    },
    comment: '선호 위치 ID'
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
      fields: ['oauth_id']
    },
    {
      fields: ['preferred_location_id']
    },
    {
      fields: ['breed_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = User;
