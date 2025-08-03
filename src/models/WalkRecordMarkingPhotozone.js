const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalkRecordMarkingPhotozone = sequelize.define('WalkRecordMarkingPhotozone', {
  walk_record_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '산책 기록 ID',
    field: 'walk_record_id'
  },
  photozone_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    comment: '마킹 포토존 ID',
    field: 'photozone_id'
  },
  visited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '해당 산책 기록 중 포토존 방문 시간',
    field: 'visited_at'
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
