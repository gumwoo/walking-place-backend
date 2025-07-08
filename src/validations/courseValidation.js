const Joi = require('joi');
const ApiResponse = require('../utils/response');
const logger = require('../config/logger');

/**
 * 코스 조회 쿼리 파라미터 검증 스키마
 */
const courseQuerySchema = Joi.object({
  sort: Joi.string()
    .valid('average_tail_score', 'created_at', 'distance')
    .default('average_tail_score')
    .messages({
      'any.only': 'sort는 average_tail_score, created_at, distance 중 하나여야 합니다'
    }),
    
  order: Joi.string()
    .valid('desc', 'asc')
    .default('desc')
    .messages({
      'any.only': 'order는 desc 또는 asc여야 합니다'
    }),
    
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'page는 숫자여야 합니다',
      'number.integer': 'page는 정수여야 합니다',
      'number.min': 'page는 1 이상이어야 합니다'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.base': 'limit는 숫자여야 합니다',
      'number.integer': 'limit는 정수여야 합니다',
      'number.min': 'limit는 1 이상이어야 합니다',
      'number.max': 'limit는 50 이하여야 합니다'
    }),
    
  level: Joi.string()
    .valid('상', '중', '하')
    .optional()
    .messages({
      'any.only': 'level은 상, 중, 하 중 하나여야 합니다'
    }),
    
  recommended_dog_size: Joi.string()
    .valid('소형', '중형', '대형')
    .optional()
    .messages({
      'any.only': 'recommended_dog_size는 소형, 중형, 대형 중 하나여야 합니다'
    })
});

/**
 * 코스 조회 쿼리 파라미터 검증 미들웨어
 */
const validateCourseQuery = (req, res, next) => {
  try {
    logger.info('코스 쿼리 검증 시작:', {
      originalQuery: req.query,
      ip: req.ip
    });

    const { error, value } = courseQuerySchema.validate(req.query, {
      abortEarly: false,  // 모든 오류 반환
      stripUnknown: true  // 알려지지 않은 속성 제거
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      logger.warn('코스 쿼리 검증 실패:', {
        errors,
        originalQuery: req.query
      });

      return ApiResponse.validationError(
        res,
        errors,
        '요청 파라미터가 올바르지 않습니다'
      );
    }

    // 검증된 값으로 req.query 업데이트
    req.query = value;

    logger.info('코스 쿼리 검증 성공:', {
      validatedQuery: req.query
    });

    next();

  } catch (validationError) {
    logger.error('코스 쿼리 검증 중 오류:', {
      error: validationError.message,
      stack: validationError.stack,
      query: req.query
    });

    return ApiResponse.serverError(
      res,
      '요청 검증 중 오류가 발생했습니다',
      validationError
    );
  }
};

module.exports = {
  validateCourseQuery
};
