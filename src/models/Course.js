const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  creator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // 기본 정보
  thumbnail_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  course_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  distance: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  level: {
    type: DataTypes.ENUM('상', '중', '하'),
    allowNull: false
  },
  recommended_dog_size: {
    type: DataTypes.ENUM('소형', '중형', '대형'),
    allowNull: true
  },
  
  // 꼬리점수 관련
  average_tail_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    defaultValue: 0
  },
  total_tail_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  review_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // 신고 관련
  is_reported: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  report_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  
  // 경로
  estimated_time: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  path_geometry: {
    type: DataTypes.GEOMETRY('LINESTRING', 4326),
    allowNull: false
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
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['creator_id']
    },
    {
      fields: ['average_tail_score']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_active', 'average_tail_score']
    }
  ]
});

module.exports = Course;
