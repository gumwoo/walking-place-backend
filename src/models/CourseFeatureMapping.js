const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseFeatureMapping = sequelize.define('CourseFeatureMapping', {
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
  
  feature_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'course_features',
      key: 'id'
    }
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'course_feature_mappings',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'feature_id']
    }
  ]
});

module.exports = CourseFeatureMapping;
