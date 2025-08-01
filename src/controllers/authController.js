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
  kakaoLogin = async (req, res) => {
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
  refreshToken = async (req, res) => {
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
  logout = async (req, res) => {
    try {
      logger.info('로그아웃 요청 시작');

      const userId = req.user.userId; // 인증 미들웨어에서 설정

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
  kakaoCallback = async (req, res) => {
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

      // 1. 인증 코드로 액세스 토큰 교환
      logger.info('카카오 토큰 교환 시작');
      const tokenResponse = await this.exchangeCodeForToken(code);
      logger.info('카카오 토큰 교환 완료', { 
        hasAccessToken: !!tokenResponse.access_token,
        tokenType: tokenResponse.token_type 
      });
      
      if (!tokenResponse.access_token) {
        throw new Error('카카오 액세스 토큰 교환에 실패했습니다.');
      }

      // 2. 카카오 로그인 처리
      logger.info('카카오 로그인 서비스 호출 시작');
      const result = await authService.kakaoLogin(tokenResponse.access_token);
      logger.info('카카오 로그인 서비스 호출 완료');

      logger.info('카카오 OAuth 콜백 처리 완료', { 
        userId: result.userId,
        isNewUser: result.isNewUser
      });

      // 3. 프론트엔드로 리다이렉트 (또는 JSON 응답)
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

  /**
   * 카카오 인증 코드를 액세스 토큰으로 교환
   * @param {string} code - 카카오 인증 코드
   * @returns {Object} 토큰 응답
   */
  exchangeCodeForToken = async (code) => {
    try {
      const axios = require('axios');
      const qs = require('querystring');

      const tokenParams = {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code: code
      };

      logger.info('카카오 토큰 교환 요청 파라미터', {
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        hasClientSecret: !!process.env.KAKAO_CLIENT_SECRET,
        codeLength: code.length
      });

      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        qs.stringify(tokenParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('카카오 토큰 교환 응답 수신', {
        status: response.status,
        hasAccessToken: !!response.data.access_token,
        tokenType: response.data.token_type
      });

      return response.data;

    } catch (error) {
      logger.error('카카오 토큰 교환 오류:', {
        message: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        stack: error.stack
      });
      throw new Error('카카오 액세스 토큰 교환에 실패했습니다.');
    }
  }
}

module.exports = new AuthController();
