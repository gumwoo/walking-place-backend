const { sequelize } = require('../config/database');

// 모든 모델 가져오기
const User = require('./User');
const Location = require('./Location');
const Breed = require('./Breed');
const WalkRecord = require('./WalkRecord');
const MarkingPhotozone = require('./MarkingPhotozone');
const MarkingPhoto = require('./MarkingPhoto');
const Course = require('./Course');
const CourseFeature = require('./CourseFeature');
const Term = require('./Term');

// 중간 테이블
const UserTermAgreement = require('./UserTermAgreement');
const CourseCourseFeature = require('./CourseCourseFeature');
const CourseLocationAssociation = require('./CourseLocationAssociation');
const WalkRecordMarkingPhotozone = require('./WalkRecordMarkingPhotozone');

// 관계 설정
const setupAssociations = () => {
  console.log('Setting up model associations...');

  // User 관계
  User.belongsTo(Location, { 
    foreignKey: 'preferredLocationId', 
    as: 'preferredLocation',
    onDelete: 'SET NULL'
  });
  Location.hasMany(User, { 
    foreignKey: 'preferredLocationId', 
    as: 'users'
  });

  User.belongsTo(Breed, { 
    foreignKey: 'breedId', 
    as: 'breed',
    onDelete: 'SET NULL'
  });
  Breed.hasMany(User, { 
    foreignKey: 'breedId', 
    as: 'users'
  });

  // User - Term (N:M through UserTermAgreement)
  User.belongsToMany(Term, {
    through: UserTermAgreement,
    foreignKey: 'userId',
    otherKey: 'termId',
    as: 'agreedTerms'
  });
  Term.belongsToMany(User, {
    through: UserTermAgreement,
    foreignKey: 'termId',
    otherKey: 'userId',
    as: 'users'
  });

  // WalkRecord 관계
  User.hasMany(WalkRecord, { 
    foreignKey: 'userId', 
    as: 'walkRecords',
    onDelete: 'CASCADE'
  });
  WalkRecord.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user'
  });

  Course.hasMany(WalkRecord, { 
    foreignKey: 'courseId', 
    as: 'walkRecords',
    onDelete: 'SET NULL'
  });
  WalkRecord.belongsTo(Course, { 
    foreignKey: 'courseId', 
    as: 'course'
  });

  // WalkRecord - MarkingPhotozone (N:M through WalkRecordMarkingPhotozone)
  WalkRecord.belongsToMany(MarkingPhotozone, {
    through: WalkRecordMarkingPhotozone,
    foreignKey: 'walkRecordId',
    otherKey: 'photozoneId',
    as: 'visitedPhotozones'
  });
  MarkingPhotozone.belongsToMany(WalkRecord, {
    through: WalkRecordMarkingPhotozone,
    foreignKey: 'photozoneId',
    otherKey: 'walkRecordId',
    as: 'walkRecords'
  });

  // Course 관계
  User.hasMany(Course, { 
    foreignKey: 'creatorUserId', 
    as: 'createdCourses',
    onDelete: 'SET NULL'
  });
  Course.belongsTo(User, { 
    foreignKey: 'creatorUserId', 
    as: 'creator'
  });

  // Course - CourseFeature (N:M through CourseCourseFeature)
  Course.belongsToMany(CourseFeature, {
    through: CourseCourseFeature,
    foreignKey: 'courseId',
    otherKey: 'featureId',
    as: 'features'
  });
  CourseFeature.belongsToMany(Course, {
    through: CourseCourseFeature,
    foreignKey: 'featureId',
    otherKey: 'courseId',
    as: 'courses'
  });

  // Course - Location (N:M through CourseLocationAssociation)
  Course.belongsToMany(Location, {
    through: CourseLocationAssociation,
    foreignKey: 'courseId',
    otherKey: 'locationId',
    as: 'locations'
  });
  Location.belongsToMany(Course, {
    through: CourseLocationAssociation,
    foreignKey: 'locationId',
    otherKey: 'courseId',
    as: 'courses'
  });

  // MarkingPhotozone 관계
  Course.hasMany(MarkingPhotozone, { 
    foreignKey: 'courseId', 
    as: 'markingPhotozones',
    onDelete: 'SET NULL'
  });
  MarkingPhotozone.belongsTo(Course, { 
    foreignKey: 'courseId', 
    as: 'course'
  });

  // MarkingPhoto 관계
  MarkingPhotozone.hasMany(MarkingPhoto, { 
    foreignKey: 'photozoneId', 
    as: 'photos',
    onDelete: 'CASCADE'
  });
  MarkingPhoto.belongsTo(MarkingPhotozone, { 
    foreignKey: 'photozoneId', 
    as: 'photozone'
  });

  User.hasMany(MarkingPhoto, { 
    foreignKey: 'userId', 
    as: 'markingPhotos',
    onDelete: 'CASCADE'
  });
  MarkingPhoto.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user'
  });

  console.log('Model associations setup completed.');
};

// 관계 설정 실행
setupAssociations();

// 모든 모델과 관계 내보내기
module.exports = {
  sequelize,
  User,
  Location,
  Breed,
  WalkRecord,
  MarkingPhotozone,
  MarkingPhoto,
  Course,
  CourseFeature,
  Term,
  UserTermAgreement,
  CourseCourseFeature,
  CourseLocationAssociation,
  WalkRecordMarkingPhotozone,
  setupAssociations
};
