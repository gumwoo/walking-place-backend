const passport = require('passport');
const ApiResponse = require('../utils/response');
const { verifyToken } = require('../config/passport');

/**
 * JWT 인증 미들웨어
 * Bearer 토큰을 검증하여 사용자 인증
 */
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error) {
      return ApiResponse.serverError(res, '인증 처리 중 오류가 발생했습니다', error);
    }

    if (!user) {
      return ApiResponse.unauthorized(res, '유효하지 않은 토큰입니다');
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * 선택적 JWT 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 다음으로 진행
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error) {
      return ApiResponse.serverError(res, '인증 처리 중 오류가 발생했습니다', error);
    }

    if (user) {
      req.user = user;
    }
    
    next();
  })(req, res, next);
};

/**
 * 토큰에서 사용자 정보 추출 (미들웨어 없이 직접 사용)
 * @param {Object} req - Express request 객체
 * @returns {Object|null} 사용자 정보 또는 null
 */
const extractUserFromToken = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return null;
    }

    const { User } = require('../models');
    const user = await User.findByPk(decoded.id);
    
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * (추후 사용자 모델에 role 필드가 추가되면 활용)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, '인증이 필요합니다');
  }

  // TODO: 사용자 모델에 role 필드 추가 후 구현
  // if (req.user.role !== 'admin') {
  //   return ApiResponse.forbidden(res, '관리자 권한이 필요합니다');
  // }

  next();
};

/**
 * 본인 확인 미들웨어
 * URL 파라미터의 userId와 토큰의 사용자 ID가 일치하는지 확인
 */
const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, '인증이 필요합니다');
  }

  const { userId } = req.params;
  
  if (userId && userId !== req.user.id) {
    return ApiResponse.forbidden(res, '본인의 정보만 접근할 수 있습니다');
  }

  next();
};

/**
 * API 키 인증 미들웨어 (선택적 사용)
 * 특정 API에서 API 키 방식의 인증이 필요한 경우
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return ApiResponse.unauthorized(res, 'API 키가 필요합니다');
  }

  if (apiKey !== process.env.API_KEY) {
    return ApiResponse.unauthorized(res, '유효하지 않은 API 키입니다');
  }

  next();
};

module.exports = {
  authenticateJWT,
  optionalAuth,
  extractUserFromToken,
  requireAdmin,
  requireOwnership,
  authenticateApiKey
};
