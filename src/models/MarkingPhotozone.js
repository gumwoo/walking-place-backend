const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarkingPhotozone = sequelize.define('MarkingPhotozone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: false
  },
  
  detection_radius: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20
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
  tableName: 'marking_photozones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['course_id']
    }
  ]
});

module.exports = MarkingPhotozone;
