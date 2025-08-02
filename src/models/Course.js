const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  courseId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '코스 고유 ID'
  },
  creatorUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '생성자 사용자 ID (추천 코스의 경우 NULL)'
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '코스명'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '코스 설명'
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'NORMAL', 'HARD'),
    allowNull: false,
    defaultValue: 'NORMAL',
    comment: '코스 난이도'
  },
  recommendedPetSize: {
    type: DataTypes.ENUM('SMALL', 'MEDIUM', 'LARGE', 'ALL'),
    allowNull: false,
    defaultValue: 'ALL',
    comment: '추천 견종 크기'
  },
  averageTailcopterScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '해당 코스 산책 기록의 평균 꼬리콥터 점수'
  },
  courseLengthMeters: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '코스 길이(미터)'
  },
  estimatedDurationSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '예상 소요 시간(초)'
  },
  coverImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '코스 대표 이미지 URL'
  },
  pathCoordinates: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: '코스 경로 좌표 리스트'
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
  tableName: 'courses',
  timestamps: true,
  comment: '산책 코스 테이블',
  indexes: [
    {
      fields: ['creator_user_id']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['recommended_pet_size']
    },
    {
      fields: ['average_tailcopter_score']
    },
    {
      fields: ['course_length_meters']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Course;
