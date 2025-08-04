const { 
  Course, 
  MarkingPhotozone, 
  CourseFeature, 
  Location,
  User,
  WalkRecord,
  CourseCourseFeature,
  CourseLocationAssociation
} = require('../models');
const { Op, Sequelize } = require('sequelize');
const logger = require('../config/logger');

/**
 * 코스 관련 서비스
 * 제공된 API 스펙 기준으로 구현
 */
class CourseService {

  /**
   * 우리 동네 추천 코스 목록 조회
   * @param {Object} params - 검색 매개변수
   * @returns {Object} 추천 코스 목록과 페이지네이션 정보
   */
  async getRecommendedCourses(params) {
    try {
      const {
        latitude,
        longitude,
        radius = 2000,
        sortBy = 'tailcopterScoreDesc',
        areaName,
        petSize,
        page = 1,
        size = 10
      } = params;

      logger.info('추천 코스 목록 조회 서비스 시작', {
        latitude,
        longitude,
        radius,
        sortBy,
        page,
        size
      });

      // 1. 검색 조건 설정
      const whereConditions = {};
      
      // 반려동물 크기 필터링
      if (petSize && petSize !== 'ALL') {
        whereConditions.recommendedPetSize = {
          [Op.in]: [petSize, 'ALL']
        };
      }

      // 2. 정렬 조건 설정
      let orderCondition;
      switch (sortBy) {
        case 'tailcopterScoreDesc':
          orderCondition = [['averageTailcopterScore', 'DESC']];
          break;
        case 'tailcopterScoreAsc':
          orderCondition = [['averageTailcopterScore', 'ASC']];
          break;
        case 'lengthDesc':
          orderCondition = [['courseLengthMeters', 'DESC']];
          break;
        case 'lengthAsc':
          orderCondition = [['courseLengthMeters', 'ASC']];
          break;
        case 'newest':
          orderCondition = [['createdAt', 'DESC']];
          break;
        case 'oldest':
          orderCondition = [['createdAt', 'ASC']];
          break;
        default:
          orderCondition = [['averageTailcopterScore', 'DESC']];
      }

      // 3. 페이지네이션 계산
      const offset = (page - 1) * size;

      // 4. 코스 목록 조회 (위치 기반 필터링은 단순화)
      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['petName', 'petBirthDate'],
            include: [
              {
                model: Breed,
                as: 'breed',
                attributes: ['name'],
                required: false
              }
            ],
            required: false
          },
          {
            model: CourseFeature,
            as: 'features',
            through: { attributes: [] },
            attributes: ['name'],
            required: false
          }
        ],
        order: orderCondition,
        limit: size,
        offset
      });

      // 5. 결과 포맷팅
      const formattedCourses = courses.map(course => {
        // 반려견 나이 계산
        let petAge = null;
        if (course.creator && course.creator.petBirthDate) {
          const birthDate = new Date(course.creator.petBirthDate);
          const today = new Date();
          petAge = today.getFullYear() - birthDate.getFullYear();
          
          // 생일이 지났는지 확인
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            petAge--;
          }
        }

        return {
          courseId: course.courseId,
          courseName: course.courseName,
          description: course.description,
          difficulty: course.difficulty,
          recommendedPetSize: course.recommendedPetSize,
          averageTailcopterScore: course.averageTailcopterScore,
          courseLengthMeters: course.courseLengthMeters,
          estimatedDurationSeconds: course.estimatedDurationSeconds,
          coverImageUrl: course.coverImageUrl,
          features: course.features.map(feature => feature.name),
          creator: course.creator ? {
            petName: course.creator.petName,
            petAge: petAge,
            breedName: course.creator.breed ? course.creator.breed.name : null
          } : null,
          createdAt: course.createdAt
        };
      });

      const result = {
        courses: formattedCourses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / size),
          totalCount: count,
          pageSize: size,
          hasNext: page < Math.ceil(count / size),
          hasPrev: page > 1
        },
        searchCriteria: {
          latitude,
          longitude,
          radius,
          sortBy,
          areaName,
          petSize
        }
      };

      logger.info('추천 코스 목록 조회 서비스 완료', {
        count,
        searchRadius: radius
      });

      return result;

    } catch (error) {
      logger.error('추천 코스 목록 조회 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 코스 상세 정보 조회
   * @param {string} courseId - 코스 ID
   * @returns {Object} 코스 상세 정보
   */
  async getCourseDetails(courseId) {
    try {
      logger.info('코스 상세 정보 조회 서비스 시작', { courseId });

      // 1. 코스 상세 정보 조회 (관련 정보 포함)
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['userId', 'petName', 'petBirthDate', 'petProfileImageUrl'],
            include: [
              {
                model: Breed,
                as: 'breed',
                attributes: ['name'],
                required: false
              }
            ],
            required: false
          },
          {
            model: CourseFeature,
            as: 'features',
            through: { attributes: [] },
            attributes: ['featureId', 'name', 'isCustom']
          },
          {
            model: MarkingPhotozone,
            as: 'markingPhotozones',
            attributes: ['photozoneId', 'latitude', 'longitude', 'isRecommended']
          }
        ]
      });

      if (!course) {
        throw new Error('지정된 코스를 찾을 수 없습니다.');
      }

      // 2. 결과 포맷팅
      // 반려견 나이 계산
      let petAge = null;
      if (course.creator && course.creator.petBirthDate) {
        const birthDate = new Date(course.creator.petBirthDate);
        const today = new Date();
        petAge = today.getFullYear() - birthDate.getFullYear();
        
        // 생일이 지났는지 확인
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          petAge--;
        }
      }

      const result = {
        courseId: course.courseId,
        courseName: course.courseName,
        difficulty: course.difficulty,
        recommendedPetSize: course.recommendedPetSize,
        averageTailcopterScore: course.averageTailcopterScore,
        courseLengthMeters: course.courseLengthMeters,
        coverImageUrl: course.coverImageUrl,
        pathCoordinates: course.pathCoordinates,
        features: course.features.map(feature => feature.name), // 문자열 배열로
        creator: course.creator ? {
          petName: course.creator.petName,
          petAge: petAge,
          breedName: course.creator.breed ? course.creator.breed.name : null,
          petProfileImageUrl: course.creator.petProfileImageUrl // 프로필 아이콘 URL 추가
        } : null,
        createdAt: course.createdAt
      };

      logger.info('코스 상세 정보 조회 서비스 완료', { courseId });

      return result;

    } catch (error) {
      logger.error('코스 상세 정보 조회 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 코스 내 마킹 포토존 정보 조회 (지도 표시용)
   * @param {string} courseId - 코스 ID
   * @returns {Array} 마킹 포토존 목록
   */
  async getCoursePhotozones(courseId) {
    try {
      logger.info('코스 내 마킹 포토존 조회 서비스 시작', { courseId });

      // 1. 코스 존재 여부 확인
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('지정된 코스를 찾을 수 없습니다.');
      }

      // 2. 해당 코스의 마킹 포토존 목록 조회 (대표 이미지 포함)
      const photozones = await MarkingPhotozone.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: PhotozonePhoto,
            as: 'photos', // 모델 관계에서 설정한 alias
            attributes: ['file_url', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 1, // 가장 최근 사진만
            required: false
          }
        ],
        attributes: [
          'id',
          'location',
          'created_at'
        ],
        order: [['created_at', 'ASC']]
      });

      logger.info('코스 내 마킹 포토존 조회 서비스 완료', {
        courseId,
        count: photozones.length
      });

      return photozones.map(zone => {
        // PostGIS Point에서 좌표 추출
        let latitude = null;
        let longitude = null;
        if (zone.location && zone.location.coordinates) {
          [longitude, latitude] = zone.location.coordinates;
        }

        return {
          id: zone.id,
          latitude: latitude,
          longitude: longitude,
          representativeImageUrl: zone.photos && zone.photos.length > 0 
            ? zone.photos[0].file_url 
            : null
        };
      });

    } catch (error) {
      logger.error('코스 내 마킹 포토존 조회 서비스 오류:', error);
      throw error;
    }
  }

  
   /* 새로 생성할 코스의 기본 정보 조회
   * @param {string} walkRecordId - 산책 기록 ID
   * @returns {Object} 새 코스 기본 정보
   */
  async getNewCourseDetails(walkRecordId) {
    try {
      logger.info('새 코스 기본 정보 조회 서비스 시작', { walkRecordId });

      // 1. 산책 기록 조회
      const walkRecord = await WalkRecord.findByPk(walkRecordId);
      if (!walkRecord) {
        throw new Error('지정된 산책 기록을 찾을 수 없습니다.');
      }

      // 2. 기본 정보 반환
      const result = {
        walkRecordId: walkRecord.walk_record_id,
        courseLengthMeters: walkRecord.distance_meters,
        pathCoordinates: walkRecord.path_coordinates,
        estimatedDurationSeconds: walkRecord.duration_seconds
      };

      logger.info('새 코스 기본 정보 조회 서비스 완료', { walkRecordId });

      return result;

    } catch (error) {
      logger.error('새 코스 기본 정보 조회 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 새로운 코스 정보 최종 등록 (유일한 코스 생성 메소드)
   * @param {Object} courseData - 코스 데이터
   * @returns {Object} 등록된 코스 정보
   */
  async createNewCourse(courseData) {
    try {
      const {
        walkRecordId,
        creatorUserId,
        courseName,
        coverImageUrl,
        difficulty,
        recommendedPetSize,
        selectedFeatures = []
      } = courseData;

      logger.info('새로운 코스 정보 최종 등록 서비스 시작', {
        walkRecordId,
        creatorUserId,
        courseName,
        selectedFeatures
      });

      // 1. 산책 기록 조회 (좌표 및 거리 정보 가져오기)
      const walkRecord = await WalkRecord.findByPk(walkRecordId);
      if (!walkRecord) {
        throw new Error('지정된 산책 기록을 찾을 수 없습니다.');
      }

      // 2. 사용자 존재 여부 확인
      if (creatorUserId) {
        const user = await User.findByPk(creatorUserId);
        if (!user) {
          throw new Error('코스 생성자를 찾을 수 없습니다.');
        }
      }

      // 3. 코스 생성 (산책 기록의 좌표와 데이터 사용)
      const course = await Course.create({
        creatorUserId,
        courseName,
        difficulty,
        recommendedPetSize,
        pathCoordinates: walkRecord.pathCoordinates, // 산책 기록의 좌표 사용
        courseLengthMeters: walkRecord.distanceMeters, // 산책 기록의 거리 사용
        estimatedDurationSeconds: walkRecord.durationSeconds, // 산책 기록의 소요 시간 사용
        coverImageUrl,
        averageTailcopterScore: walkRecord.tailcopterScore || 0 // 산책 기록의 꼬리콥터 점수 초기값으로 사용
      });

      // 4. 코스 특징 처리 및 연결
      const featureIds = [];
      
      for (const featureName of selectedFeatures) {
        // 기존 특징인지 확인
        let existingFeature = await CourseFeature.findOne({ 
          where: { name: featureName } 
        });
        
        // 없으면 새로 생성 (커스텀 특징)
        if (!existingFeature) {
          existingFeature = await CourseFeature.create({
            name: featureName,
            isCustom: true
          });
          
          logger.info('새로운 커스텀 특징 생성', {
            featureName,
            featureId: existingFeature.featureId
          });
        }
        
        featureIds.push(existingFeature.featureId);
      }

      // 5. 코스-특징 연결
      if (featureIds.length > 0) {
        const featureAssociations = featureIds.map(featureId => ({
          courseId: course.courseId,
          featureId
        }));
        
        await CourseCourseFeature.bulkCreate(featureAssociations);
      }

      // 6. 산책 기록에 코스 등록 완료 표시
      await walkRecord.update({
        isCourseRegistered: true,
        courseId: course.courseId
      });

      logger.info('새로운 코스 정보 최종 등록 서비스 완료', {
        walkRecordId,
        courseId: course.courseId,
        courseName,
        featuresCount: featureIds.length
      });

      return {
        courseId: course.courseId,
        courseName: course.courseName,
        difficulty: course.difficulty,
        recommendedPetSize: course.recommendedPetSize,
        courseLengthMeters: course.courseLengthMeters,
        estimatedDurationSeconds: course.estimatedDurationSeconds,
        pathCoordinates: course.pathCoordinates,
        coverImageUrl: course.coverImageUrl,
        selectedFeatures: selectedFeatures,
        createdAt: course.createdAt,
        walkRecordId: walkRecordId
      };

    } catch (error) {
      logger.error('새로운 코스 정보 최종 등록 서비스 오류:', error);
      throw error;
    }
  }
}

module.exports = new CourseService();
