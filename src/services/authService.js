const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');
const qs = require('querystring');

/**
 * 인증 관련 서비스
 */
class AuthService {

  /**
   * 카카오 OAuth 콜백 처리 및 로그인
   * @param {string} code - 카카오에서 받은 인증 코드
   * @returns {Object} 사용자 정보 및 서비스 토큰
   */
  async kakaoCallbackLogin(code) {
    try {
      logger.info('카카오 콜백 로그인 서비스 시작');

      // 1. 인증 코드로 액세스 토큰 교환
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      if (!tokenResponse.access_token) {
        throw new Error('카카오 액세스 토큰 교환에 실패했습니다.');
      }

      // 2. 카카오 로그인 처리 (기존 kakaoLogin 메소드 재활용)
      const result = await this.kakaoLogin(tokenResponse.access_token);
      
      logger.info('카카오 콜백 로그인 서비스 완료');

      return result;
    } catch (error) {
      logger.error('카카오 콜백 로그인 서비스 오류:', error);
      throw error;
    }
  }
  
  /**
   * 카카오 인증 코드를 액세스 토큰으로 교환
   * @param {string} code - 카카오 인증 코드
   * @returns {Object} 토큰 응답
   */
  async exchangeCodeForToken(code) {
    try {
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
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      const detail = JSON.stringify(error.response?.data);
      throw new Error(`카카오 액세스 토큰 교환 실패: ${detail}`);
    }
  }

  /**
   * 카카오 로그인/회원가입 처리
   * @param {string} kakaoAccessToken - 카카오에서 받은 액세스 토큰
   * @returns {Object} 사용자 정보 및 서비스 토큰
   */
  async kakaoLogin(kakaoAccessToken) {
    try {
      logger.info('카카오 로그인 서비스 시작');

      // 1. 카카오 API로 사용자 정보 조회
      const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);
      
      if (!kakaoUserInfo) {
        throw new Error('카카오 사용자 정보를 가져올 수 없습니다.');
      }

      const { id: socialId } = kakaoUserInfo;

      // 2. 기존 사용자 확인
      let user = await User.findOne({
        where: { 
          oauth_provider: 'kakao',
          oauth_id: socialId.toString() 
        }
      });

      let isNewUser = false;

      if (!user) {
        // 3. 신규 사용자 생성
        user = await User.create({
          oauth_provider: 'kakao',
          oauth_id: socialId.toString(),
          created_at: new Date(),
          updated_at: new Date()
        });
        isNewUser = true;
        logger.info('신규 사용자 생성 완료', { userId: user.id });
      } else {
        logger.info('기존 사용자 로그인', { userId: user.id });
      }

      // 4. 프로필 설정 완료 여부 확인
      const isProfileSetupCompleted = this.checkProfileComplete(user);

      // 5. 서비스 자체 JWT 토큰 생성
      const tokens = this.generateTokens(user.id);

      logger.info('카카오 로그인 서비스 완료', {
        userId: user.id,
        isNewUser,
        isProfileSetupCompleted
      });

      return {
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isNewUser,
        isProfileSetupCompleted
      };

    } catch (error) {
      logger.error('카카오 로그인 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 카카오 API로 사용자 정보 조회
   * @param {string} accessToken - 카카오 액세스 토큰
   * @returns {Object} 카카오 사용자 정보
   */
  async getKakaoUserInfo(accessToken) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });

      return response.data;

    } catch (error) {
      logger.error('카카오 사용자 정보 조회 오류:', error);
      throw new Error('카카오 사용자 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * 프로필 설정 완료 여부 확인
   * @param {Object} user - 사용자 객체
   * @returns {boolean} 프로필 설정 완료 여부
   */
  checkProfileComplete(user) {
    return !!(
      user.dog_name && 
      user.dog_breed && 
      user.dog_birth_year && 
      user.dog_size &&
      user.preferred_location_id
    );
  }

  /**
   * 서비스 자체 JWT 토큰 생성
   * @param {string} userId - 사용자 ID
   * @returns {Object} 액세스 토큰과 리프레시 토큰
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * 액세스 토큰 갱신
   * @param {string} refreshToken - 리프레시 토큰
   * @returns {Object} 새로운 액세스 토큰
   */
  async refreshAccessToken(refreshToken) {
    try {
      logger.info('액세스 토큰 갱신 서비스 시작');

      // 1. 리프레시 토큰 검증
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // 2. 사용자 확인 (실제 모델에는 토큰 저장 필드가 없으므로 단순히 사용자 존재 확인)
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 3. 새로운 액세스 토큰 생성
      const newAccessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.info('액세스 토큰 갱신 완료', { userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken // 기존 리프레시 토큰 유지
      };

    } catch (error) {
      logger.error('액세스 토큰 갱신 오류:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
