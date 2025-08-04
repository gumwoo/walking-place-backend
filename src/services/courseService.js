const {
  Course,
  MarkingPhotozone,
  CourseFeature,
  Location,
  User,
  WalkRecord,
  CourseCourseFeature,
  CourseLocationAssociation,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const logger = require("../config/logger");
const Breed = require("../models/Breed");
const { MarkingPhoto } = require("../models");

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
        sortBy = "tailcopterScoreDesc",
        areaName,
        petSize,
        page = 1,
        size = 10,
      } = params;

      logger.info("추천 코스 목록 조회 서비스 시작", {
        latitude,
        longitude,
        radius,
        sortBy,
        page,
        size,
      });

      const whereConditions = {};

      // 반려동물 크기 필터링
      if (petSize && petSize !== "ALL") {
        whereConditions.recommended_pet_size = {
          [Op.in]: [petSize, "ALL"],
        };
      }

      // 정렬 조건 설정
      const orderCondition = (() => {
        switch (sortBy) {
          case "tailcopterScoreAsc":
            return [["average_tailcopter_score", "ASC"]];
          case "lengthDesc":
            return [["course_length_meters", "DESC"]];
          case "lengthAsc":
            return [["course_length_meters", "ASC"]];
          case "newest":
            return [["created_at", "DESC"]];
          case "oldest":
            return [["created_at", "ASC"]];
          case "tailcopterScoreDesc":
          default:
            return [["average_tailcopter_score", "DESC"]];
        }
      })();

      const offset = (page - 1) * size;

      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["user_id", "dog_name", "dog_birth_year", "dog_image"],
            include: [
              {
                model: Breed,
                as: "breed",
                attributes: ["name"],
                required: false,
              },
            ],
            required: false,
          },
          {
            model: CourseFeature,
            as: "features",
            through: { attributes: [] },
            attributes: ["name"],
            
          },
      
        ],
        order: orderCondition,
        limit: size,
        offset,
      });

      // 코스 포맷 변환
      const formattedCourses = courses.map((course) => {
        // 반려견 나이 계산
        let petAge = null;
        if (course.creator?.dog_birth_year) {
          const now = new Date();
          petAge = now.getFullYear() - course.creator.dog_birth_year;
        }

        return {
          courseId: course.course_id,
          courseName: course.course_name,
          description: course.description,
          difficulty: course.difficulty,
          recommendedPetSize: course.recommended_pet_size,
          averageTailcopterScore: course.average_tailcopter_score,
          courseLengthMeters: course.course_length_meters,
          estimatedDurationSeconds: course.estimated_duration_seconds,
          coverImageUrl: course.cover_image_url,
          features: course.features?.map((f) => f.name),
          creator: course.creator
            ? {
                petName: course.creator.dog_name,
                petAge,
                breedName: course.creator.dog_breed || null,
                petProfileImageUrl: course.creator.dog_image,
              }
            : null,
          createdAt: course.created_at,
        };
      });

      return {
        courses: formattedCourses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / size),
          totalCount: count,
          pageSize: size,
          hasNext: page < Math.ceil(count / size),
          hasPrev: page > 1,
        },
        searchCriteria: {
          latitude,
          longitude,
          radius,
          sortBy,
          areaName,
          petSize,
        },
      };
    } catch (error) {
      logger.error("추천 코스 목록 조회 서비스 오류:", error);
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
      logger.info("코스 상세 정보 조회 서비스 시작", { courseId });

      // 1. 코스 상세 정보 조회
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: [
              "user_id", // snake_case 필드
              "dog_name",
              "dog_birth_year",
              "dog_image",
            ],
            include: [
              {
                model: Breed,
                as: "breed",
                attributes: ["name"],
                required: false,
              },
            ],
            required: false,
          },
          {
            model: CourseFeature,
            as: "features",
            through: { attributes: [] },
            attributes: ["feature_id", "name", "is_custom"],
          },
          {
            model: MarkingPhotozone,
            as: "markingPhotozones",
            attributes: [
              "photozone_id",
              "latitude",
              "longitude",
              "is_recommended",
            ],
          },
        ],
      });

      if (!course) {
        throw new Error("지정된 코스를 찾을 수 없습니다.");
      }

      // 2. 반려견 나이 계산
      const petAge =
        course.creator && course.creator.dog_birth_year
          ? new Date().getFullYear() - course.creator.dog_birth_year
          : null;

      // 3. 결과 포맷 변환 및 반환
      const result = {
        courseId: course.course_id,
        courseName: course.course_name,
        difficulty: course.difficulty,
        recommendedPetSize: course.recommended_pet_size,
        averageTailcopterScore: course.average_tailcopter_score,
        courseLengthMeters: course.course_length_meters,
        estimatedDurationSeconds: course.estimated_duration_seconds,
        coverImageUrl: course.cover_image_url,
        pathCoordinates: course.path_coordinates,
        features: course.features.map((feature) => feature.name),
        creator: course.creator
          ? {
              petName: course.creator.dog_name,
              petAge: petAge,
              breedName: course.creator.dog_breed,
              petProfileImageUrl: course.creator.dog_image,
            }
          : null,
        markingPhotozones: course.markingPhotozones.map((zone) => ({
          photozoneId: zone.photozone_id,
          latitude: zone.latitude,
          longitude: zone.longitude,
          isRecommended: zone.is_recommended,
        })),
        createdAt: course.created_at,
      };

      logger.info("코스 상세 정보 조회 서비스 완료", { courseId });
      return result;
    } catch (error) {
      logger.error("코스 상세 정보 조회 서비스 오류:", error);
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
      logger.info("코스 내 마킹 포토존 조회 서비스 시작", { courseId });

      // 1. 코스 존재 여부 확인
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error("지정된 코스를 찾을 수 없습니다.");
      }

      // 2. 해당 코스의 마킹 포토존 목록 조회 (대표 이미지 포함)
      const photozones = await MarkingPhotozone.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: MarkingPhoto,
            as: "markingPhotos", // 모델 관계에서 설정한 alias
            attributes: ["image_url", "created_at"],
            order: [["created_at", "DESC"]],
            limit: 1, // 가장 최근 사진만
            required: false,
          },
        ],
        attributes: ["photozone_id", "latitude", "longitude", "created_at"],
        order: [["created_at", "ASC"]],
      });

      logger.info("코스 내 마킹 포토존 조회 서비스 완료", {
        courseId,
        count: photozones.length,
      });

      return photozones.map((zone) => {
        // 가장 최근 사진만 추출
        const sortedPhotos = zone.markingPhotos?.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        return {
          id: zone.photozone_id,
          latitude: zone.latitude,
          longitude: zone.longitude,
          representativeImageUrl:
            sortedPhotos && sortedPhotos.length > 0
              ? sortedPhotos[0].image_url
              : null,
        };
      });
    } catch (error) {
      logger.error("코스 내 마킹 포토존 조회 서비스 오류:", error);
      throw error;
    }
  }

  /* 새로 생성할 코스의 기본 정보 조회
   * @param {string} walkRecordId - 산책 기록 ID
   * @returns {Object} 새 코스 기본 정보
   */
  async getNewCourseDetails(walkRecordId) {
    try {
      logger.info("새 코스 기본 정보 조회 서비스 시작", { walkRecordId });

      // 1. 산책 기록 조회
      const walkRecord = await WalkRecord.findByPk(walkRecordId);
      if (!walkRecord) {
        throw new Error("지정된 산책 기록을 찾을 수 없습니다.");
      }

      // 2. 기본 정보 반환
      const result = {
        walkRecordId: walkRecord.walk_record_id,
        courseLengthMeters: walkRecord.distance_meters,
        pathCoordinates: walkRecord.path_coordinates,
        estimatedDurationSeconds: walkRecord.duration_seconds,
      };

      logger.info("새 코스 기본 정보 조회 서비스 완료", { walkRecordId });

      return result;
    } catch (error) {
      logger.error("새 코스 기본 정보 조회 서비스 오류:", error);
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
        selectedFeatures = [],
      } = courseData;

      logger.info("새로운 코스 정보 최종 등록 서비스 시작", {
        walkRecordId,
        creatorUserId,
        courseName,
        selectedFeatures,
      });

      // 1. 산책 기록 조회 (좌표 및 거리 정보 가져오기)
      const walkRecord = await WalkRecord.findByPk(walkRecordId);
      if (!walkRecord) {
        throw new Error("지정된 산책 기록을 찾을 수 없습니다.");
      }

      // 2. 사용자 존재 여부 확인
      if (creatorUserId) {
        const user = await User.findByPk(creatorUserId);
        if (!user) {
          throw new Error("코스 생성자를 찾을 수 없습니다.");
        }
      }

      // 3. 코스 생성 (산책 기록의 좌표와 데이터 사용)
      const course = await Course.create({
        creator_user_id: creatorUserId,
        course_name: courseName,
        difficulty,
        recommended_pet_size: recommendedPetSize,
        path_coordinates: walkRecord.path_coordinates, // 산책 기록의 좌표 사용
        course_length_meters: walkRecord.distance_meters, // 산책 기록의 거리 사용
        estimated_duration_seconds: walkRecord.duration_seconds, // 산책 기록의 소요 시간 사용
        cover_image_url: coverImageUrl,
        average_tailcopter_score: walkRecord.tailcopter_score || 0, // 산책 기록의 꼬리콥터 점수 초기값으로 사용
      });

      // 4. 코스 특징 처리 및 연결
      const featureIds = [];
      console.log("✅ featureIds 확인:", featureIds);

      for (const featureName of selectedFeatures) {
        // 기존 특징인지 확인
        let existingFeature = await CourseFeature.findOne({
          where: { name: featureName },
        });

        // 없으면 새로 생성 (커스텀 특징)
        if (!existingFeature) {
          existingFeature = await CourseFeature.create({
            name: featureName,
            isCustom: true,
          });

          logger.info("새로운 커스텀 특징 생성", {
            featureName,
            featureId: existingFeature.featureId,
          });
        }

        featureIds.push(existingFeature.feature_id);
      }

      // 5. 코스-특징 연결
      if (featureIds.length > 0) {
        const featureAssociations = featureIds.map((featureId) => ({
          courseId: course.course_id,
          featureId,
        }));

        await CourseCourseFeature.bulkCreate(featureAssociations);
      }

      // 6. 산책 기록에 코스 등록 완료 표시
      await walkRecord.update({
        is_course_registered: true,
        course_id: course.courseId,
      });

      logger.info("새로운 코스 정보 최종 등록 서비스 완료", {
        walkRecordId,
        courseId: course.courseId,
        courseName,
        featuresCount: featureIds.length,
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
        walkRecordId: walkRecordId,
      };
    } catch (error) {
      logger.error("새로운 코스 정보 최종 등록 서비스 오류:", error);
      throw error;
    }
  }
}

module.exports = new CourseService();
