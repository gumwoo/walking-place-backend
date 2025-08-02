const logger = require('../config/logger');
const ApiResponse = require('../utils/response');

/**
* 404 Not Found 핸들러
*/
const notFoundHandler = (req, res, next) => {
 logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
   method: req.method,
   url: req.url,
   ip: req.ip,
   userAgent: req.get('User-Agent')
 });

 return res.status(404).json({
   success: false,
   message: '요청하신 리소스를 찾을 수 없습니다.',
   code: 'NOT_FOUND',
   path: req.url
 });
};

/**
* 전역 에러 핸들러
*/
const errorHandler = (err, req, res, next) => {
 // 에러 로깅
 logger.error('서버 에러 발생:', {
   message: err.message,
   stack: err.stack,
   method: req.method,
   url: req.url,
   ip: req.ip,
   userAgent: req.get('User-Agent'),
   body: req.body,
   query: req.query,
   params: req.params
 });

 // 개발 환경에서는 스택 트레이스 포함
 const isDevelopment = process.env.NODE_ENV === 'development';

 // Sequelize 에러 처리
 if (err.name === 'SequelizeValidationError') {
   const validationErrors = err.errors.map(error => ({
     field: error.path,
     message: error.message,
     value: error.value
   }));

   return res.status(400).json({
     success: false,
     message: '입력 데이터 검증에 실패했습니다.',
     code: 'VALIDATION_ERROR',
     errors: validationErrors,
     ...(isDevelopment && { stack: err.stack })
   });
 }

 // Sequelize 외래키 제약 조건 에러
 if (err.name === 'SequelizeForeignKeyConstraintError') {
   return res.status(400).json({
     success: false,
     message: '참조 무결성 제약 조건을 위반했습니다.',
     code: 'FOREIGN_KEY_CONSTRAINT_ERROR',
     ...(isDevelopment && { details: err.message, stack: err.stack })
   });
 }

 // Sequelize 고유 제약 조건 에러
 if (err.name === 'SequelizeUniqueConstraintError') {
   const conflictFields = err.errors.map(error => error.path);
   
   return res.status(409).json({
     success: false,
     message: '중복된 데이터가 존재합니다.',
     code: 'UNIQUE_CONSTRAINT_ERROR',
     conflictFields,
     ...(isDevelopment && { stack: err.stack })
   });
 }

 // Sequelize 데이터베이스 연결 오류
 if (err.name === 'SequelizeConnectionError') {
   return res.status(500).json({
     success: false,
     message: '데이터베이스 연결 오류가 발생했습니다.',
     code: 'DATABASE_CONNECTION_ERROR',
     ...(isDevelopment && { stack: err.stack })
   });
 }

 // JWT 에러 처리
 if (err.name === 'JsonWebTokenError') {
   return res.status(401).json({
     success: false,
     message: '유효하지 않은 토큰입니다.',
     code: 'INVALID_TOKEN'
   });
 }

 if (err.name === 'TokenExpiredError') {
   return res.status(401).json({
     success: false,
     message: '토큰이 만료되었습니다.',
     code: 'TOKEN_EXPIRED'
   });
 }

 // Multer 에러 처리 (파일 업로드)
 if (err.code === 'LIMIT_FILE_SIZE') {
   return res.status(400).json({
     success: false,
     message: '파일 크기가 너무 큽니다.',
     code: 'FILE_TOO_LARGE'
   });
 }

 if (err.code === 'LIMIT_FILE_COUNT') {
   return res.status(400).json({
     success: false,
     message: '파일 개수가 제한을 초과했습니다.',
     code: 'TOO_MANY_FILES'
   });
 }

 if (err.code === 'LIMIT_UNEXPECTED_FILE') {
   return res.status(400).json({
     success: false,
     message: '예상되지 않은 파일 필드입니다.',
     code: 'UNEXPECTED_FILE'
   });
 }

 // Passport 인증 오류
 if (err.name === 'AuthenticationError') {
   return res.status(401).json({
     success: false,
     message: err.message || '인증에 실패했습니다.',
     code: 'AUTHENTICATION_ERROR'
   });
 }

 // Rate Limit 에러
 if (err.status === 429) {
   return res.status(429).json({
     success: false,
     message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
     code: 'TOO_MANY_REQUESTS'
   });
 }

 // 커스텀 에러 처리 (statusCode 또는 status 속성이 있는 경우)
 if (err.statusCode || err.status) {
   const statusCode = err.statusCode || err.status;
   return res.status(statusCode).json({
     success: false,
     message: err.message || '오류가 발생했습니다.',
     code: 'CUSTOM_ERROR',
     ...(isDevelopment && { stack: err.stack })
   });
 }

 // 기본 HTTP 에러 처리
 if (err.status && err.status >= 400 && err.status < 500) {
   return res.status(err.status).json({
     success: false,
     message: err.message || '클라이언트 요청 오류가 발생했습니다.',
     code: 'CLIENT_ERROR',
     ...(isDevelopment && { stack: err.stack })
   });
 }

 // 서버 에러 (500)
 return res.status(500).json({
   success: false,
   message: '서버 내부 오류가 발생했습니다.',
   code: 'INTERNAL_SERVER_ERROR',
   ...(isDevelopment && {
     error: err.message,
     stack: err.stack
   })
 });
};

/**
* 비동기 에러 캐처
* Express의 async/await 에러를 자동으로 next()로 전달
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

/**
* 프로세스 레벨 에러 핸들러
*/
const setupProcessErrorHandlers = () => {
 // 처리되지 않은 Promise 거부
 process.on('unhandledRejection', (reason, promise) => {
   logger.error('Unhandled Rejection:', {
     reason: reason,
     promise: promise,
     stack: reason?.stack
   });
   
   // 개발 환경에서는 프로세스 종료
   if (process.env.NODE_ENV === 'development') {
     process.exit(1);
   }
 });

 // 처리되지 않은 예외
 process.on('uncaughtException', (error) => {
   logger.error('Uncaught Exception:', {
     message: error.message,
     stack: error.stack
   });
   
   // 안전한 종료
   process.exit(1);
 });

 // SIGTERM 처리 (우아한 종료)
 process.on('SIGTERM', () => {
   logger.info('SIGTERM received. Shutting down gracefully...');
   process.exit(0);
 });

 // SIGINT 처리 (Ctrl+C)
 process.on('SIGINT', () => {
   logger.info('SIGINT received. Shutting down gracefully...');
   process.exit(0);
 });
};

module.exports = {
 errorHandler,
 notFoundHandler,
 asyncHandler,
 AppError,
 setupProcessErrorHandlers
};