const courseService = require('../services/courseService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: 산책 코스 관련 API
 */
class CourseController {

  /**
   * @swagger
   * /api/v1/courses/recommendations:
   *   get:
   *     tags: [Courses]
   *     summary: 우리 동네 추천 코스 목록 조회
   *     description: "현재 위치를 기준으로 주변 추천 코스 요약 목록을 조회합니다."
   *     parameters:
   *       - in: query
   *         name: latitude
   *         required: true
   *         schema:
   *           type: number
   *           format: float
   *           example: 37.5665
   *       - in: query
   *         name: longitude
   *         required: true
   *         schema:
   *           type: number
   *           format: float
   *           example: 126.9780
   *       - in: query
   *         name: radius
   *         schema:
   *           type: integer
   *           default: 2000
   *           description: "검색반경(미터)"
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [tailcopterScoreDesc, recent]
   *           default: tailcopterScoreDesc
   *           description: "정렬 기준. 꼬리콥터 점수 내림차순 또는 최신순"
   *       - in: query
   *         name: areaName
   *         schema:
   *           type: string
   *           description: "지역명 (예: 서울특별시 중구)"
   *       - in: query
   *         name: petSize
   *         schema:
   *           type: string
   *           enum: [SMALL, MEDIUM, LARGE, ALL]
   *           description: "추천 견종 크기"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *           description: "페이지 번호"
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           default: 10
   *           description: "페이지당 항목 수"
   *     responses:
   *       '200':
   *         description: "추천 코스 목록 조회 성공"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseListResponse'
   *       '400':
   *         description: 유효하지 않은 요청 (위도/경도 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getRecommendedCourses(req, res) {
    try {
      logger.info('추천 코스 목록 조회 요청 시작');
      
      const { 
        latitude, 
        longitude, 
        radius = 2000, 
        sortBy = 'tailcopterScoreDesc',
        areaName,
        petSize,
        page = 1,
        size = 10
      } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: '위도와 경도가 필요합니다.',
          code: 'MISSING_COORDINATES'
        });
      }

      const result = await courseService.getRecommendedCourses({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        sortBy,
        areaName,
        petSize,
        page: parseInt(page),
        size: parseInt(size)
      });
      
      logger.info('추천 코스 목록 조회 성공', { 
        count: result.courses.length,
        totalCount: result.totalCount
      });
      
      return res.status(200).json({
        success: true,
        message: '추천 코스 목록을 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('추천 코스 목록 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '추천 코스 목록 조회 중 오류가 발생했습니다.',
        code: 'RECOMMENDED_COURSES_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/courses/{courseId}:
   *   get:
   *     tags: [Courses]
   *     summary: 코스 상세 정보 조회
   *     description: "특정 코스의 상세 정보를 조회합니다. 경로, 특징, 평균 점수 등이 포함됩니다."
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 코스의 고유 ID
   *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   *     responses:
   *       '200':
   *         description: 코스 상세 정보 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseDetailsResponse'
   *       '400':
   *         description: 유효하지 않은 요청 (코스 ID 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '404':
   *         description: 코스를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getCourseDetails(req, res) {
    try {
      logger.info('코스 상세 정보 조회 요청 시작');
      
      const { courseId } = req.params;
      
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: '코스 ID가 필요합니다.',
          code: 'MISSING_COURSE_ID'
        });
      }

      const courseDetails = await courseService.getCourseDetails(courseId);
      
      logger.info('코스 상세 정보 조회 성공', { courseId });
      
      return res.status(200).json({
        success: true,
        message: '코스 상세 정보를 성공적으로 조회했습니다.',
        data: courseDetails
      });

    } catch (error) {
      logger.error('코스 상세 정보 조회 실패:', error);
      
      if (error.message.includes('코스를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'COURSE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '코스 상세 정보 조회 중 오류가 발생했습니다.',
        code: 'COURSE_DETAILS_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/courses/{courseId}/marking-photozones:
   *   get:
   *     tags: [Courses]
   *     summary: 코스 내 마킹 포토존 정보 조회
   *     description: "특정 코스 내에 위치한 마킹 포토존 목록을 조회합니다."
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 코스의 고유 ID
   *           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   *     responses:
   *       '200':
   *         description: 마킹 포토존 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CoursePhotozoneResponse'
   *       '400':
   *         description: 유효하지 않은 요청 (코스 ID 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '404':
   *         description: 코스를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getCoursePhotozones(req, res) {
    try {
      logger.info('코스 내 마킹 포토존 조회 요청 시작');
      
      const { courseId } = req.params;
      
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: '코스 ID가 필요합니다.',
          code: 'MISSING_COURSE_ID'
        });
      }

      const photozones = await courseService.getCoursePhotozones(courseId);
      
      logger.info('코스 내 마킹 포토존 조회 성공', { 
        courseId, 
        count: photozones.length 
      });
      
      return res.status(200).json({
        success: true,
        message: '코스 내 마킹 포토존 정보를 성공적으로 조회했습니다.',
        data: {
          courseId,
          photozones
        }
      });

    } catch (error) {
      logger.error('코스 내 마킹 포토존 조회 실패:', error);
      
      if (error.message.includes('코스를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'COURSE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '코스 내 마킹 포토존 조회 중 오류가 발생했습니다.',
        code: 'COURSE_PHOTOZONES_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/courses/new/details:
   *   get:
   *     tags: [Courses]
   *     summary: 새 코스 등록을 위한 기본 정보 조회
   *     description: "산책 기록 ID를 바탕으로 새로운 코스 등록 시 필요한 기본 정보(경로, 거리, 시간 등)를 미리 조회합니다."
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 코스를 생성할 산책 기록의 고유 ID
   *           example: "c2d3e4f5-g6h7-8901-2345-67890abcdef1"
   *     responses:
   *       '200':
   *         description: 기본 정보 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NewCourseDetailsResponse'
   *       '400':
   *         description: 유효하지 않은 요청 (산책 기록 ID 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 산책 기록을 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getNewCourseDetails(req, res) {
    try {
      logger.info('새 코스 기본 정보 조회 요청 시작');
      
      const { walkRecordId } = req.query;
      
      if (!walkRecordId) {
        return res.status(400).json({
          success: false,
          message: '산책 기록 ID가 필요합니다.',
          code: 'MISSING_WALK_RECORD_ID'
        });
      }

      const result = await courseService.getNewCourseDetails(walkRecordId);
      
      logger.info('새 코스 기본 정보 조회 성공', { walkRecordId });
      
      return res.status(200).json({
        success: true,
        message: '새 코스 기본 정보를 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('새 코스 기본 정보 조회 실패:', error);
      
      if (error.message.includes('산책 기록을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'WALK_RECORD_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '새 코스 기본 정보 조회 중 오류가 발생했습니다.',
        code: 'NEW_COURSE_DETAILS_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/courses/new:
   *   post:
   *     tags: [Courses]
   *     summary: 새로운 코스 최종 등록
   *     description: "산책 기록과 코스 정보를 최종 등록하여 새로운 코스를 생성합니다."
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - walkRecordId
   *               - courseName
   *               - difficulty
   *               - recommendedPetSize
   *             properties:
   *               walkRecordId:
   *                 type: string
   *                 format: uuid
   *                 description: 코스 생성의 기반이 되는 산책 기록 ID
   *                 example: "c2d3e4f5-g6h7-8901-2345-67890abcdef1"
   *               courseName:
   *                 type: string
   *                 maxLength: 10
   *                 description: 코스의 이름
   *                 example: "우리 동네 한바퀴"
   *               difficulty:
   *                 type: string
   *                 enum: [상, 중, 하]
   *                 description: 코스의 난이도
   *                 example: "중"
   *               recommendedPetSize:
   *                 type: string
   *                 enum: [SMALL, MEDIUM, LARGE]
   *                 description: 추천 견종 크기
   *                 example: "MEDIUM"
   *               selectedFeatures:
   *                 type: array
   *                 items:
   *                   type: string
   *                   maxLength: 5
   *                 description: 코스 특징 목록
   *                 maxItems: 3
   *                 example: ["물가", "벤치"]
   *     responses:
   *       '201':
   *         description: 코스 등록 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CourseCreateResponse'
   *       '400':
   *         description: 유효하지 않은 요청 (필수값 누락, 유효성 검증 실패 등)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 산책 기록 또는 사용자를 찾을 수 없음
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async createNewCourse(req, res) {
    try {
      logger.info('새로운 코스 정보 최종 등록 요청 시작');
      
      const userId = req.user?.userId; // 인증 미들웨어에서 설정
      const { 
        walkRecordId, 
        courseName, 
        difficulty, 
        recommendedPetSize,
        selectedFeatures 
      } = req.body;
      
      // 필수 필드 검증
      if (!walkRecordId) {
        return res.status(400).json({
          success: false,
          message: '산책 기록 ID가 필요합니다.',
          code: 'MISSING_WALK_RECORD_ID'
        });
      }
      
      if (!courseName || courseName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '코스명이 필요합니다.',
          code: 'MISSING_COURSE_NAME'
        });
      }
      
      if (courseName.length > 10) {
        return res.status(400).json({
          success: false,
          message: '코스명은 최대 10자까지 입력 가능합니다.',
          code: 'COURSE_NAME_TOO_LONG'
        });
      }
      
      if (!difficulty || !['상', '중', '하'].includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: '올바른 난이도를 선택해주세요. (상/중/하)',
          code: 'INVALID_DIFFICULTY'
        });
      }
      
      const difficultyMap = {
        '하': 'EASY',
        '중': 'NORMAL', 
        '상': 'HARD'
      };
      const mappedDifficulty = difficultyMap[difficulty] || difficulty;

      if (!recommendedPetSize || !['SMALL', 'MEDIUM', 'LARGE'].includes(recommendedPetSize)) {
        return res.status(400).json({
          success: false,
          message: '올바른 추천 견종을 선택해주세요. (소형/중형/대형)',
          code: 'INVALID_PET_SIZE'
        });
      }
      
      // selectedFeatures 검증 (최대 3개)
      if (selectedFeatures && selectedFeatures.length > 3) {
        return res.status(400).json({
          success: false,
          message: '코스 특징은 최대 3개까지 선택 가능합니다.',
          code: 'TOO_MANY_FEATURES'
        });
      }
      
      // 커스텀 특징 길이 검증 (최대 5자)
      if (selectedFeatures) {
        for (const feature of selectedFeatures) {
          if (feature.length > 5) {
            return res.status(400).json({
              success: false,
              message: '특징명은 최대 5자까지 입력 가능합니다.',
              code: 'FEATURE_NAME_TOO_LONG'
            });
          }
        }
      }
      
      const courseData = {
        ...req.body,
        difficulty: mappedDifficulty,
        creatorUserId: userId
      };

      const result = await courseService.createNewCourse(courseData);
      
      logger.info('새로운 코스 정보 최종 등록 성공', { 
        walkRecordId,
        courseId: result.courseId,
        courseName: result.courseName,
        featuresCount: selectedFeatures?.length || 0
      });
      
      return res.status(201).json({
        success: true,
        message: '새로운 코스 정보가 성공적으로 등록되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('새로운 코스 정보 최종 등록 실패:', error);
      
      if (error.message.includes('산책 기록을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'WALK_RECORD_NOT_FOUND'
        });
      }
      
      if (error.message.includes('생성자를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'CREATOR_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '새로운 코스 정보 등록 중 오류가 발생했습니다.',
        code: 'NEW_COURSE_CREATE_ERROR'
      });
    }
  }
}

module.exports = new CourseController();
