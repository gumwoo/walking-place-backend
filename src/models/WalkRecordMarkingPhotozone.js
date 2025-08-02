const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalkRecordMarkingPhotozone = sequelize.define('WalkRecordMarkingPhotozone', {
  walkRecordId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '산책 기록 ID'
  },
  photozoneId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '마킹 포토존 ID'
  },
  visitedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '해당 산책 기록 중 포토존 방문 시간'
  }
}, {
  tableName: 'walk_record_marking_photozones',
  timestamps: false,
  comment: '산책 기록-마킹 포토존 연결 테이블',
  indexes: [
    {
      fields: ['walk_record_id']
    },
    {
      fields: ['photozone_id']
    },
    {
      fields: ['visited_at']
    }
  ]
});

module.exports = WalkRecordMarkingPhotozone;
