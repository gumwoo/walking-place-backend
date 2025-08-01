const userService = require('../services/userService');
const logger = require('../config/logger');

class UserController {
  /**
   * 사용자 약관 동의 상태 저장
   * POST /api/v1/users/me/terms
   */
  async agreeToTerms(req, res) {
    try {
      logger.info('약관 동의 요청 시작', { userId: req.user.userId });
      
      const { agreedTermIds } = req.body;
      
      if (!agreedTermIds || !Array.isArray(agreedTermIds)) {
        return res.status(400).json({
          success: false,
          message: '동의한 약관 ID 목록이 필요합니다.',
          code: 'MISSING_AGREED_TERMS'
        });
      }

      await userService.agreeToTerms(req.user.userId, agreedTermIds);
      
      logger.info('약관 동의 완료', { userId: req.user.userId });
      
      return res.status(200).json({
        success: true,
        message: '약관 동의가 저장되었습니다.'
      });

    } catch (error) {
      logger.error('약관 동의 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '약관 동의 처리 중 오류가 발생했습니다.',
        code: 'TERMS_AGREEMENT_ERROR'
      });
    }
  }

  /**
   * 사용자 프로필 업데이트 (위치/반려동물 정보)
   * PUT /api/v1/users/me/profile
   */
  async updateProfile(req, res) {
    try {
      logger.info('프로필 업데이트 요청 시작', { userId: req.user.userId });
      
      const updateData = req.body;
      const updatedUser = await userService.updateProfile(req.user.userId, updateData);
      
      logger.info('프로필 업데이트 완료', { userId: req.user.userId });
      
      return res.status(200).json({
        success: true,
        message: '프로필이 업데이트되었습니다.',
        data: {
          isProfileSetupCompleted: !!(
            updatedUser.petName && 
            updatedUser.breedId && 
            updatedUser.preferredLocationId &&
            updatedUser.isTermsAgreed
          )
        }
      });

    } catch (error) {
      logger.error('프로필 업데이트 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '프로필 업데이트 중 오류가 발생했습니다.',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  /**
   * 대표 반려동물 이름 및 아이콘 정보 조회
   * GET /api/v1/users/me/summary-profile
   */
  async getSummaryProfile(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;

      logger.info("요약 프로필 조회 요청", { userId });

      const summaryProfile = await userService.getSummaryProfile(userId);

      return res.status(200).json({
        success: true,
        data: summaryProfile,
      });
    } catch (error) {
      logger.error("요약 프로필 조회 실패:", error);

      return res.status(500).json({
        success: false,
        message: "프로필 정보 조회 중 오류가 발생했습니다.",
        code: "SUMMARY_PROFILE_ERROR",
      });
    }
  }

  /**
   * 사용자 및 반려동물 프로필 정보 조회 (마이 프로필/프로필 편집)
   * GET /api/v1/users/me/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;
      logger.info("프로필 조회 요청", { userId });

      const profile = await userService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error("프로필 조회 실패:", error);

      return res.status(500).json({
        success: false,
        message: "프로필 정보 조회 중 오류가 발생했습니다.",
        code: "PROFILE_GET_ERROR",
      });
    }
  }

  /**
   * 사용자의 모든 산책 기록 목록 조회
   * GET /api/v1/users/me/walk-records
   */
  async getWalkRecords(req, res) {
    try {
      logger.info("산책 기록 목록 조회 요청", { userId: req.user.userId });

      const { page = 1, size = 10, sortBy = "createdAt" } = req.query;

      const walkRecords = await userService.getWalkRecords(req.user.userId, {
        page: parseInt(page),
        size: parseInt(size),
        sortBy,
      });

      return res.status(200).json({
        success: true,
        data: walkRecords,
      });
    } catch (error) {
      logger.error("산책 기록 목록 조회 실패:", error);

      return res.status(500).json({
        success: false,
        message: "산책 기록 조회 중 오류가 발생했습니다.",
        code: "WALK_RECORDS_GET_ERROR",
      });
    }
  }
}

module.exports = new UserController();
