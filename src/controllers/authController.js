const authService = require('../services/authService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 * name: Auth
 * description: 인증 관련 API
 */
class AuthController {

  /**
   * @swagger
   * /api/v1/auth/kakao:
   * post:
   * tags: [Auth]
   * summary: 카카오 액세스 토큰으로 로그인/회원가입
   * description: "클라이언트에서 받은 유효한 카카오 액세스 토큰으로 로그인하거나 신규 회원가입을 처리합니다. 토큰은 `Authorization` 헤더에 `Bearer {token}` 형식으로 전달해야 합니다."
   * security:
   * - bearerAuth: []
   * responses:
   * '200':
   * description: 로그인 성공 또는 회원가입
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ApiResponse'
   * example:
   * success: true
   * message: "카카오 로그인이 성공적으로 완료되었습니다."
   * data:
   * userId: "uuid-of-user"
   * accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * isNewUser: false
   * isProfileSetupCompleted: true
   * '400':
   * description: 유효하지 않은 요청 (토큰 누락 등)
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
   * example:
   * success: false
   * message: "Authorization 헤더에 Bearer 토큰이 필요합니다."
   * '401':
   * description: 유효하지 않은 카카오 토큰
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
   * example:
   * success: false
   * message: "유효하지 않은 카카오 토큰입니다."
   * '500':
   * description: 서버 오류
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
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
   * @swagger
   * /api/v1/auth/token/refresh:
   * post:
   * tags: [Auth]
   * summary: 액세스 토큰 갱신
   * description: "만료된 액세스 토큰을 리프레시 토큰을 사용하여 갱신합니다."
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * required:
   * - refreshToken
   * properties:
   * refreshToken:
   * type: string
   * description: 리프레시 토큰
   * example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNjMyNzk2MzY2LCJleHAiOjE2MzM0MDE1NjZ9.G31Jk-..."
   * responses:
   * '200':
   * description: 토큰 갱신 성공
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ApiResponse'
   * example:
   * success: true
   * message: "액세스 토큰이 성공적으로 갱신되었습니다."
   * data:
   * accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNjMyNzk2MzY2LCJleHAiOjE2MzI4MjQ3NjZ9.G31Jk..."
   * refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNjMyNzk2MzY2LCJleHAiOjE2MzM0MDE1NjZ9.G31Jk-..."
   * '400':
   * description: 리프레시 토큰 누락
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
   * example:
   * success: false
   * message: "리프레시 토큰이 필요합니다."
   * '401':
   * description: 유효하지 않은 리프레시 토큰
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
   * example:
   * success: false
   * message: "유효하지 않은 리프레시 토큰입니다."
   * '500':
   * description: 서버 오류
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
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
   * @swagger
   * /api/v1/auth/logout:
   * post:
   * tags: [Auth]
   * summary: 로그아웃
   * description: "사용자의 세션을 로그아웃 처리합니다. JWT는 Stateless이므로 서버에서 토큰을 만료시킬 수 없습니다. 클라이언트에서 토큰을 삭제하면 됩니다. 이 API는 주로 로그 기록용으로 사용됩니다."
   * security:
   * - bearerAuth: []
   * responses:
   * '200':
   * description: 로그아웃 성공
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ApiResponse'
   * example:
   * success: true
   * message: "성공적으로 로그아웃되었습니다."
   * '401':
   * description: 인증 실패
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
   * '500':
   * description: 서버 오류
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/ErrorResponse'
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
