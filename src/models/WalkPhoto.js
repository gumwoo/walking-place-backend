const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalkPhoto = sequelize.define('WalkPhoto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  walk_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'walks',
      key: 'id'
    }
  },
  
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  
  photo_type: {
    type: DataTypes.ENUM('route', 'marking'),
    allowNull: false
  },
  
  image_order: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'walk_photos',
  timestamps: false,
  indexes: [
    {
      fields: ['walk_id']
    },
    {
      fields: ['photo_type']
    }
  ]
});

module.exports = WalkPhoto;
