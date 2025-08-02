const authService = require('../services/authService');
const logger = require('../config/logger');

/**
 * 인증 관련 컨트롤러
 */
class AuthController {

  /**
   * 카카오 로그인/회원가입
   * POST /api/v1/auth/kakao
   */
  async kakaoLogin(req, res) {
    try {
      logger.info('카카오 로그인 요청 시작');

      // Authorization 헤더에서 카카오 액세스 토큰 추출
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
          success: false,
          message: 'Authorization 헤더에 Bearer 토큰이 필요합니다.',
          code: 'MISSING_KAKAO_TOKEN'
        });
      }

      const kakaoAccessToken = authHeader.replace('Bearer ', '');

      if (!kakaoAccessToken) {
        return res.status(400).json({
          success: false,
          message: '카카오 액세스 토큰이 필요합니다.',
          code: 'MISSING_KAKAO_TOKEN'
        });
      }

      // 카카오 로그인 처리
      const result = await authService.kakaoLogin(kakaoAccessToken);

      logger.info('카카오 로그인 성공', { 
        userId: result.userId,
        isNewUser: result.isNewUser
      });

      return res.status(200).json({
        success: true,
        message: '카카오 로그인이 성공적으로 완료되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('카카오 로그인 실패:', error);

      if (error.message.includes('카카오 사용자 정보')) {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 카카오 토큰입니다.',
          code: 'INVALID_KAKAO_TOKEN'
        });
      }

      return res.status(500).json({
        success: false,
        message: '카카오 로그인 처리 중 오류가 발생했습니다.',
        code: 'KAKAO_LOGIN_ERROR'
      });
    }
  }

  /**
   * 액세스 토큰 갱신
   * POST /api/v1/auth/token/refresh
   */
  async refreshToken(req, res) {
    try {
      logger.info('액세스 토큰 갱신 요청 시작');

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: '리프레시 토큰이 필요합니다.',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      logger.info('액세스 토큰 갱신 성공');

      return res.status(200).json({
        success: true,
        message: '액세스 토큰이 성공적으로 갱신되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('액세스 토큰 갱신 실패:', error);

      if (error.message.includes('유효하지 않은')) {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 리프레시 토큰입니다.',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      return res.status(500).json({
        success: false,
        message: '토큰 갱신 중 오류가 발생했습니다.',
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  }

  /**
   * 로그아웃
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    try {
      logger.info('로그아웃 요청 시작');

      const userId = req.user?.userId || process.env.TEST_USER_ID; // 인증 미들웨어에서 설정

      // 실제 모델에는 토큰 저장 필드가 없으므로 로그 기록만
      logger.info('로그아웃 성공', { userId });

      return res.status(200).json({
        success: true,
        message: '성공적으로 로그아웃되었습니다.'
      });

    } catch (error) {
      logger.error('로그아웃 실패:', error);

      return res.status(500).json({
        success: false,
        message: '로그아웃 처리 중 오류가 발생했습니다.',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  /**
   * 카카오 OAuth 콜백 처리
   * GET /api/v1/auth/kakao/callback
   */
  async kakaoCallback(req, res) {
    try {
      logger.info('카카오 OAuth 콜백 요청 시작', { 
        query: req.query,
        headers: req.headers 
      });

      const { code, error } = req.query;

      if (error) {
        logger.error('카카오 OAuth 인증 실패:', error);
        return res.status(400).json({
          success: false,
          message: '카카오 로그인이 취소되었거나 실패했습니다.',
          code: 'KAKAO_AUTH_CANCELLED'
        });
      }

      if (!code) {
        logger.error('카카오 인증 코드 누락', { query: req.query });
        return res.status(400).json({
          success: false,
          message: '카카오 인증 코드가 필요합니다.',
          code: 'MISSING_AUTH_CODE'
        });
      }

      logger.info('카카오 인증 코드 수신 성공', { code: code.substring(0, 10) + '...' });

      // 1. 서비스 레이어의 메소드 호출
      logger.info('카카오 토큰 교환 및 로그인 서비스 호출 시작');
      const result = await authService.kakaoCallbackLogin(code);
      logger.info('카카오 OAuth 콜백 처리 완료', { 
        userId: result.userId,
        isNewUser: result.isNewUser
      });

      // 2. 프론트엔드로 리다이렉트 (또는 JSON 응답)
      return res.status(200).json({
        success: true,
        message: '카카오 로그인이 성공적으로 완료되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('카카오 OAuth 콜백 실패:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      return res.status(500).json({
        success: false,
        message: '카카오 로그인 처리 중 오류가 발생했습니다.',
        code: 'KAKAO_CALLBACK_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AuthController();
