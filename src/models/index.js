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
const Location = require('./Location');
const Breed = require('./Breed');
const Term = require('./Term');
const UserTermAgreement = require('./UserTermAgreement');

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

// User와 Location 관계 (선호 위치)
User.belongsTo(Location, {
  foreignKey: 'preferred_location_id',
  as: 'preferredLocation'
});
Location.hasMany(User, {
  foreignKey: 'preferred_location_id',
  as: 'users'
});

// User와 Term 관계 (Many-to-Many through UserTermAgreement)
User.belongsToMany(Term, {
  through: UserTermAgreement,
  foreignKey: 'user_id',
  otherKey: 'term_id',
  as: 'agreedTerms'
});
Term.belongsToMany(User, {
  through: UserTermAgreement,
  foreignKey: 'term_id',
  otherKey: 'user_id',
  as: 'users'
});

// User와 UserTermAgreement 관계
User.hasMany(UserTermAgreement, {
  foreignKey: 'user_id',
  as: 'termAgreements'
});
UserTermAgreement.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Term과 UserTermAgreement 관계
Term.hasMany(UserTermAgreement, {
  foreignKey: 'term_id',
  as: 'userAgreements'
});
UserTermAgreement.belongsTo(Term, {
  foreignKey: 'term_id',
  as: 'term'
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
  Location,
  Breed,
  Term,
  UserTermAgreement,
  sequelize
};

module.exports = models;
