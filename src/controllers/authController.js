const authService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  /**
   * 카카오 로그인/회원가입
   * POST /api/v1/auth/kakao
   */
  async kakaoLogin(req, res) {
    try {
      logger.info('카카오 로그인 요청 시작');
      
      const kakaoAccessToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!kakaoAccessToken) {
        return res.status(400).json({
          success: false,
          message: '카카오 액세스 토큰이 필요합니다.',
          code: 'MISSING_KAKAO_TOKEN'
        });
      }

      const result = await authService.kakaoLogin(kakaoAccessToken);
      
      logger.info('카카오 로그인 성공', { userId: result.userId });
      
      return res.status(200).json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('카카오 로그인 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
        code: 'KAKAO_LOGIN_ERROR'
      });
    }
  }

  /**
   * 만료된 액세스 토큰 갱신
   * POST /api/v1/auth/token/refresh
   */
  async refreshToken(req, res) {
    try {
      logger.info('토큰 갱신 요청 시작');
      
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: '리프레시 토큰이 필요합니다.',
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      
      logger.info('토큰 갱신 성공');
      
      return res.status(200).json({
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('토큰 갱신 실패:', error);
      
      return res.status(401).json({
        success: false,
        message: '토큰 갱신에 실패했습니다.',
        code: 'TOKEN_REFRESH_ERROR'
      });
    }
  }
}

module.exports = new AuthController();
