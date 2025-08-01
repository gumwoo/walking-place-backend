const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * JWT 토큰 검증 미들웨어
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('인증 헤더 누락', { path: req.path });
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
        code: 'MISSING_AUTHORIZATION_HEADER'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('잘못된 인증 헤더 형식', { 
        path: req.path,
        authHeader: authHeader.substring(0, 20) + '...'
      });
      return res.status(401).json({
        success: false,
        message: 'Bearer 토큰이 필요합니다.',
        code: 'INVALID_AUTHORIZATION_FORMAT'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('토큰 누락', { path: req.path });
      return res.status(401).json({
        success: false,
        message: '액세스 토큰이 필요합니다.',
        code: 'MISSING_ACCESS_TOKEN'
      });
    }

    // JWT 토큰 검증
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug('JWT 토큰 검증 성공', { 
        userId: decoded.userId,
        path: req.path 
      });
    } catch (jwtError) {
      logger.warn('JWT 토큰 검증 실패', { 
        path: req.path,
        error: jwtError.message 
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: '토큰이 만료되었습니다.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 토큰입니다.',
          code: 'INVALID_TOKEN'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: '토큰 검증에 실패했습니다.',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

    // 사용자 존재 여부 확인
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      logger.warn('존재하지 않는 사용자', { 
        userId: decoded.userId,
        path: req.path 
      });
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 사용자입니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      userId: user.user_id,
      socialId: user.social_id,
      socialType: user.social_type,
      petName: user.pet_name,
      breedId: user.breed_id,
      petSize: user.pet_size,
      preferredLocationId: user.preferred_location_id
    };

    logger.debug('인증 성공', { 
      userId: req.user.userId,
      path: req.path 
    });

    next();

  } catch (error) {
    logger.error('인증 미들웨어 오류:', {
      error: error.message,
      stack: error.stack,
      path: req.path
    });

    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.',
      code: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 토큰이 없으면 그냥 통과
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        req.user = {
          userId: user.user_id,
          socialId: user.social_id,
          socialType: user.social_type,
          petName: user.pet_name,
          breedId: user.breed_id,
          petSize: user.pet_size,
          preferredLocationId: user.preferred_location_id
        };
        
        logger.debug('선택적 인증 성공', { 
          userId: req.user.userId,
          path: req.path 
        });
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      // JWT 오류는 무시하고 계속 진행
      req.user = null;
      logger.debug('선택적 인증 - 토큰 검증 실패 (무시)', { 
        path: req.path,
        error: jwtError.message 
      });
    }

    next();

  } catch (error) {
    logger.error('선택적 인증 미들웨어 오류:', {
      error: error.message,
      path: req.path
    });
    
    // 오류가 발생해도 계속 진행
    req.user = null;
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  // 추후 User 모델에 role 필드 추가시 사용
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: '관리자 권한이 필요합니다.',
  //     code: 'ADMIN_REQUIRED'
  //   });
  // }

  next();
};

/**
 * 프로필 설정 완료 확인 미들웨어
 */
const requireProfileComplete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  // 필수 프로필 정보 확인
  if (!req.user.petName || !req.user.breedId || !req.user.petSize) {
    return res.status(400).json({
      success: false,
      message: '프로필 설정을 완료해주세요.',
      code: 'PROFILE_INCOMPLETE',
      data: {
        hasPetName: !!req.user.petName,
        hasBreedId: !!req.user.breedId,
        hasPetSize: !!req.user.petSize
      }
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireProfileComplete
};