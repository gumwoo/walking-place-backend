const { sequelize } = require('../config/database');

// ERD 기준 모델들 임포트
const User = require('./User');
const Location = require('./Location');
const Breed = require('./Breed');
const WalkRecord = require('./WalkRecord');
const MarkingPhotozone = require('./MarkingPhotozone');
const MarkingPhoto = require('./MarkingPhoto');
const Course = require('./Course');
const CourseFeature = require('./CourseFeature');
const Term = require('./Term');

// 연결 테이블들
const UserTermAgreement = require('./UserTermAgreement');
const CourseCourseFeature = require('./CourseCourseFeature');
const CourseLocationAssociation = require('./CourseLocationAssociation');
const WalkRecordMarkingPhotozone = require('./WalkRecordMarkingPhotozone');

// ====== ERD 기준 관계 설정 ======

// User - Location (N:1, preferredLocationId)
User.belongsTo(Location, {
  foreignKey: 'preferredLocationId',
  as: 'preferredLocation'
});
Location.hasMany(User, {
  foreignKey: 'preferredLocationId',
  as: 'users'
});

// User - Breed (N:1, breedId)
User.belongsTo(Breed, {
  foreignKey: 'breedId',
  as: 'breed'
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

// User - WalkRecord (1:N)
User.hasMany(WalkRecord, {
  foreignKey: 'userId',
  as: 'walkRecords'
});
WalkRecord.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - Course (1:N, creatorUserId)
User.hasMany(Course, {
  foreignKey: 'creatorUserId',
  as: 'createdCourses'
});
Course.belongsTo(User, {
  foreignKey: 'creatorUserId',
  as: 'creator'
});

// User - MarkingPhoto (1:N)
User.hasMany(MarkingPhoto, {
  foreignKey: 'userId',
  as: 'markingPhotos'
});
MarkingPhoto.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Course - WalkRecord (1:N)
Course.hasMany(WalkRecord, {
  foreignKey: 'courseId',
  as: 'walkRecords'
});
WalkRecord.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Course - MarkingPhotozone (1:N)
Course.hasMany(MarkingPhotozone, {
  foreignKey: 'courseId',
  as: 'markingPhotozones'
});
MarkingPhotozone.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// MarkingPhotozone - MarkingPhoto (1:N)
MarkingPhotozone.hasMany(MarkingPhoto, {
  foreignKey: 'photozoneId',
  as: 'markingPhotos'
});
MarkingPhoto.belongsTo(MarkingPhotozone, {
  foreignKey: 'photozoneId',
  as: 'photozone'
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

// WalkRecord - MarkingPhotozone (N:M through WalkRecordMarkingPhotozone)
WalkRecord.belongsToMany(MarkingPhotozone, {
  through: WalkRecordMarkingPhotozone,
  foreignKey: 'walkRecordId',
  otherKey: 'photozoneId',
  as: 'markingPhotozones'
});
MarkingPhotozone.belongsToMany(WalkRecord, {
  through: WalkRecordMarkingPhotozone,
  foreignKey: 'photozoneId',
  otherKey: 'walkRecordId',
  as: 'walkRecords'
});

// ====== 모델 내보내기 ======
const models = {
  // 주 엔티티
  User,
  Location,
  Breed,
  WalkRecord,
  MarkingPhotozone,
  MarkingPhoto,
  Course,
  CourseFeature,
  Term,
  
  // 연결 테이블
  UserTermAgreement,
  CourseCourseFeature,
  CourseLocationAssociation,
  WalkRecordMarkingPhotozone,
  
  // Sequelize 인스턴스
  sequelize
};

module.exports = models;
