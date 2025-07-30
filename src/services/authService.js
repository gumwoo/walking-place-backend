const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

class AuthService {
  /**
   * 카카오 사용자 정보 가져오기
   */
  async getKakaoUserInfo(accessToken) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('카카오 사용자 정보 조회 실패:', error);
      throw new Error('카카오 사용자 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * JWT 토큰 생성
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * 카카오 로그인/회원가입
   */
  async kakaoLogin(kakaoAccessToken) {
    try {
      // 카카오 사용자 정보 가져오기
      const kakaoUser = await this.getKakaoUserInfo(kakaoAccessToken);
      const socialId = kakaoUser.id.toString();

      // 기존 사용자 확인
      let user = await User.findOne({
        where: { socialId },
        include: [
          { association: 'preferredLocation' },
          { association: 'breed' }
        ]
      });

      let isNewUser = false;
      let isProfileSetupCompleted = true;

      if (!user) {
        // 신규 사용자 생성
        user = await User.create({
          socialId,
          socialType: 'KAKAO'
        });
        isNewUser = true;
        isProfileSetupCompleted = false;
      } else {
        // 프로필 설정 완료 여부 확인
        isProfileSetupCompleted = !!(
          user.petName && 
          user.breedId && 
          user.preferredLocationId &&
          user.isTermsAgreed
        );
      }

      // JWT 토큰 생성
      const { accessToken, refreshToken } = this.generateTokens(user.userId);

      // 토큰을 사용자 정보에 저장
      await user.update({
        accessToken,
        refreshToken
      });

      logger.info('카카오 로그인 성공', { 
        userId: user.userId, 
        isNewUser,
        isProfileSetupCompleted 
      });

      return {
        userId: user.userId,
        accessToken,
        refreshToken,
        isNewUser,
        isProfileSetupCompleted
      };

    } catch (error) {
      logger.error('카카오 로그인 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 리프레시 토큰으로 액세스 토큰 갱신
   */
  async refreshToken(refreshToken) {
    try {
      // 리프레시 토큰 검증
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // 사용자 확인
      const user = await User.findByPk(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('유효하지 않은 리프레시 토큰입니다.');
      }

      // 새로운 토큰 생성
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.userId);

      // 새로운 토큰 저장
      await user.update({
        accessToken,
        refreshToken: newRefreshToken
      });

      return {
        accessToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      logger.error('토큰 갱신 실패:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
