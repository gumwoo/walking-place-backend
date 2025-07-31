const logger = require('../config/logger');
const ApiResponse = require('../utils/response');

/**
 * 글로벌 에러 핸들러 미들웨어
 * 모든 예외를 통일된 형태로 처리
 */
const errorHandler = (error, req, res, next) => {
  // 로그 기록
  logger.logError(error, req);

  // Sequelize 유효성 검사 오류
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return ApiResponse.validationError(res, errors, '데이터 유효성 검사 실패');
  }

  // Sequelize 고유 제약 조건 오류
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || '알 수 없는 필드';
    return ApiResponse.error(res, `${field}가 이미 존재합니다`, 409);
  }

  // Sequelize 외래키 제약 조건 오류
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.error(res, '참조된 데이터가 존재하지 않습니다', 400);
  }

  // Sequelize 데이터베이스 연결 오류
  if (error.name === 'SequelizeConnectionError') {
    return ApiResponse.serverError(res, '데이터베이스 연결 오류가 발생했습니다');
  }

  // JWT 토큰 오류
  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, '유효하지 않은 토큰입니다');
  }

  // JWT 토큰 만료 오류
  if (error.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, '토큰이 만료되었습니다');
  }

  // 멀터 파일 업로드 오류
  if (error.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.error(res, '파일 크기가 너무 큽니다', 413);
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return ApiResponse.error(res, '파일 개수가 제한을 초과했습니다', 413);
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiResponse.error(res, '예상되지 않은 파일 필드입니다', 400);
  }

  // Passport 인증 오류
  if (error.name === 'AuthenticationError') {
    return ApiResponse.unauthorized(res, error.message || '인증에 실패했습니다');
  }

  // 커스텀 오류 처리
  if (error.statusCode || error.status) {
    const statusCode = error.statusCode || error.status;
    const message = error.message || '오류가 발생했습니다';
    return ApiResponse.error(res, message, statusCode);
  }

  // 기본 서버 오류
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '서버 내부 오류가 발생했습니다' 
    : error.message;

  return ApiResponse.serverError(res, message, error.stack);
};

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res, next) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  return ApiResponse.notFound(res, '요청하신 API 엔드포인트를 찾을 수 없습니다');
};

/**
 * 비동기 함수 에러 캐치 래퍼
 * @param {Function} fn - 비동기 함수
 * @returns {Function} - 에러를 캐치하는 미들웨어
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 커스텀 에러 클래스
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};