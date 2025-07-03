const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseReport = sequelize.define('CourseReport', {
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
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  
  report_reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'course_reports',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id']
    },
    {
      fields: ['course_id']
    }
  ]
});

module.exports = CourseReport;
