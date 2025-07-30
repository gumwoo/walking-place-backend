const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    comment: '사용자 고유 ID',
    field: 'user_id'
  },
  socialId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '카카오에서 제공하는 사용자 고유 ID',
    field: 'social_id'
  },
  socialType: {
    type: DataTypes.ENUM('KAKAO'),
    allowNull: false,
    defaultValue: 'KAKAO',
    comment: '소셜 로그인 타입'
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '서비스 자체 JWT 액세스 토큰'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '서비스 자체 JWT 리프레시 토큰'
  },
  isTermsAgreed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '약관 동의 여부'
  },
  preferredLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '선호 위치 ID (온보딩 후 설정 또는 변경 가능)'
  },
  petName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '반려동물 이름'
  },
  breedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '견종 ID'
  },
  petBirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '반려동물 생년월일'
  },
  petSize: {
    type: DataTypes.ENUM('SMALL', 'MEDIUM', 'LARGE'),
    allowNull: true,
    comment: '반려동물 크기'
  },
  petProfileImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '반려동물 프로필 아이콘 URL'
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
  tableName: 'users',
  timestamps: true,
  comment: '사용자 및 반려동물 정보 통합 테이블',
  indexes: [
    {
      unique: true,
      fields: ['social_id']
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
