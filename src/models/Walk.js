const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

const Walk = sequelize.define('Walk', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  
  // 산책 기본 정보
  walk_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  
  // 시간 정보
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // 거리 및 통계
  total_distance: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  total_time: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  marking_count: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tail_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // 경로
  walk_path: {
    type: DataTypes.GEOMETRY('LINESTRING', 4326),
    allowNull: true
  },

  // 실시간 GPS 좌표
   raw_coordinates: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  
  // 상태
  status: {
    type: DataTypes.ENUM('started', 'completed', 'cancelled', 'paused', 'resumed'),
    allowNull: false
    // defaultValue 제거하고 애플리케이션에서 처리
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
  tableName: 'walks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['user_id', 'status']
    }
  ]
});

module.exports = Walk;
