const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const CourseReport = require('./CourseReport');
const CourseFeature = require('./CourseFeature');
const CourseFeatureMapping = require('./CourseFeatureMapping');
const Walk = require('./Walk');
const WalkPhoto = require('./WalkPhoto');
const MarkingPhotozone = require('./MarkingPhotozone');
const PhotozonePhoto = require('./PhotozonePhoto');

// User와 Course 관계
User.hasMany(Course, {
  foreignKey: 'creator_id',
  as: 'createdCourses'
});
Course.belongsTo(User, {
  foreignKey: 'creator_id',
  as: 'creator'
});

// User와 CourseReport 관계
User.hasMany(CourseReport, {
  foreignKey: 'user_id',
  as: 'courseReports'
});
CourseReport.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'reporter'
});

// Course와 CourseReport 관계
Course.hasMany(CourseReport, {
  foreignKey: 'course_id',
  as: 'reports'
});
CourseReport.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Course와 CourseFeatureMapping 관계
Course.hasMany(CourseFeatureMapping, {
  foreignKey: 'course_id',
  as: 'featureMappings'
});
CourseFeatureMapping.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// CourseFeature와 CourseFeatureMapping 관계
CourseFeature.hasMany(CourseFeatureMapping, {
  foreignKey: 'feature_id',
  as: 'courseMappings'
});
CourseFeatureMapping.belongsTo(CourseFeature, {
  foreignKey: 'feature_id',
  as: 'feature'
});

// Course와 CourseFeature Many-to-Many 관계
Course.belongsToMany(CourseFeature, {
  through: CourseFeatureMapping,
  foreignKey: 'course_id',
  otherKey: 'feature_id',
  as: 'features'
});
CourseFeature.belongsToMany(Course, {
  through: CourseFeatureMapping,
  foreignKey: 'feature_id',
  otherKey: 'course_id',
  as: 'courses'
});

// User와 Walk 관계
User.hasMany(Walk, {
  foreignKey: 'user_id',
  as: 'walks'
});
Walk.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Course와 Walk 관계
Course.hasMany(Walk, {
  foreignKey: 'course_id',
  as: 'walks'
});
Walk.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Walk과 WalkPhoto 관계
Walk.hasMany(WalkPhoto, {
  foreignKey: 'walk_id',
  as: 'photos'
});
WalkPhoto.belongsTo(Walk, {
  foreignKey: 'walk_id',
  as: 'walk'
});

// Course와 MarkingPhotozone 관계
Course.hasMany(MarkingPhotozone, {
  foreignKey: 'course_id',
  as: 'markingPhotozones'
});
MarkingPhotozone.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// MarkingPhotozone과 PhotozonePhoto 관계
MarkingPhotozone.hasMany(PhotozonePhoto, {
  foreignKey: 'marking_photozone_id',
  as: 'photos'
});
PhotozonePhoto.belongsTo(MarkingPhotozone, {
  foreignKey: 'marking_photozone_id',
  as: 'markingPhotozone'
});

// User와 PhotozonePhoto 관계
User.hasMany(PhotozonePhoto, {
  foreignKey: 'user_id',
  as: 'photozonePhotos'
});
PhotozonePhoto.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Walk과 PhotozonePhoto 관계
Walk.hasMany(PhotozonePhoto, {
  foreignKey: 'walk_id',
  as: 'photozonePhotos'
});
PhotozonePhoto.belongsTo(Walk, {
  foreignKey: 'walk_id',
  as: 'walk'
});

// 모델 객체 내보내기
const models = {
  User,
  Course,
  CourseReport,
  CourseFeature,
  CourseFeatureMapping,
  Walk,
  WalkPhoto,
  MarkingPhotozone,
  PhotozonePhoto,
  sequelize
};

module.exports = models;
