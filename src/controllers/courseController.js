const courseService = require('../services/courseService');
const ApiResponse = require('../utils/response');
const logger = require('../config/logger');

/**
 * 코스 목록 조회 (꼬리점수 정렬)
 */
const getCourses = async (req, res) => {
  try {
    logger.info('코스 목록 조회 요청:', {
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const {
      sort = 'average_tail_score',
      order = 'desc',
      page = 1,
      limit = 10,
      level,
      recommended_dog_size
    } = req.query;

    // 쿼리 파라미터 로깅
    logger.info('코스 조회 파라미터:', {
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit),
      level,
      recommended_dog_size
    });

    // 서비스 호출
    const result = await courseService.getCourseList({
      sort,
      order,
      page: parseInt(page),
      limit: parseInt(limit),
      level,
      recommended_dog_size
    });

    logger.info('코스 목록 조회 성공:', {
      totalItems: result.pagination.totalItems,
      currentPage: result.pagination.currentPage,
      returnedItems: result.courses.length
    });

    // 페이지네이션 응답
    return ApiResponse.paginated(
      res,
      result.courses,
      result.pagination,
      '코스 목록이 조회되었습니다'
    );

  } catch (error) {
    logger.error('코스 목록 조회 실패:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });

    return ApiResponse.serverError(
      res,
      '코스 목록 조회 중 오류가 발생했습니다',
      error
    );
  }
};

module.exports = {
  getCourses
};
