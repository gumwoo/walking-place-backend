const courseService = require('../services/courseService');
const logger = require('../config/logger');

/**
 * 코스 관련 컨트롤러
 * 제공된 API 스펙 기준으로 구현
 */
class CourseController {

  /**
   * 우리 동네 추천 코스 요약 목록 조회
   * GET /api/v1/courses/recommendations
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
   * 선택된 추천 코스의 상세 정보 조회
   * GET /api/v1/courses/{course_id}
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
   * 코스 내 마킹 포토존 정보 조회
   * GET /api/v1/courses/{course_id}/marking-photozones
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

  
   /* 새로 생성할 코스의 기본 정보 조회
   * GET /api/v1/courses/new/details
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
   * 새로운 코스 정보 최종 등록
   * POST /api/v1/courses/new
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
