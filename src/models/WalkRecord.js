const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalkRecord = sequelize.define('WalkRecord', {
  walkRecordId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '산책 기록 고유 ID'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '사용자 ID'
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '코스 ID (새 코스 산책 시 NULL)'
  },
  status: {
    type: DataTypes.ENUM('STARTED', 'PAUSED', 'COMPLETED', 'CANCELED', 'ABANDONED'),
    allowNull: false,
    defaultValue: 'STARTED',
    comment: '산책 상태'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '산책 시작 시간'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '산책 종료 시간 (STARTED 또는 PAUSED 상태일 때는 NULL)'
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '산책 시간(초) - COMPLETED 상태에서 최종 계산'
  },
  distanceMeters: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '산책 거리(미터) - COMPLETED 상태에서 최종 계산'
  },
  pathCoordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: '산책 경로 좌표 리스트 - 산책 중 지속 업데이트'
  },
  markingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '마킹 횟수'
  },
  tailcopterScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '꼬리콥터 점수'
  },
  isCourseRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '코스 등록 여부'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'walk_records',
  timestamps: true,
  comment: '산책 기록 테이블',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['courseId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['startTime']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = WalkRecord;
