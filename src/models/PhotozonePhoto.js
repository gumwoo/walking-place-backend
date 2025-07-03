const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PhotozonePhoto = sequelize.define('PhotozonePhoto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  marking_photozone_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'marking_photozones',
      key: 'id'
    }
  },
  
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  walk_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'walks',
      key: 'id'
    }
  },
  
  file_url: {
    type: DataTypes.STRING(500),
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
  tableName: 'photozone_photos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['marking_photozone_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['walk_id']
    }
  ]
});

module.exports = PhotozonePhoto;
