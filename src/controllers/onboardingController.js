const onboardingService = require('../services/onboardingService');
const logger = require('../config/logger');

/**
 * 온보딩 관련 컨트롤러
 */
class OnboardingController {

  /**
   * 사용자 약관 동의 상태 저장
   * POST /api/v1/users/me/terms
   */
  saveTermAgreements = async (req, res) => {
    try {
      logger.info('사용자 약관 동의 저장 요청 시작');

      const userId = req.user.id; // JWT 미들웨어에서 설정
      const { agreedTermIds } = req.body;

      if (!agreedTermIds || !Array.isArray(agreedTermIds) || agreedTermIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '동의한 약관 ID 목록이 필요합니다.',
          code: 'MISSING_AGREED_TERMS'
        });
      }

      const result = await onboardingService.saveTermAgreements(userId, agreedTermIds);

      logger.info('사용자 약관 동의 저장 성공', { userId, termCount: agreedTermIds.length });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          agreedTermCount: result.agreedTermCount
        }
      });

    } catch (error) {
      logger.error('사용자 약관 동의 저장 실패:', error);

      if (error.message.includes('유효하지 않은')) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 약관 ID가 포함되어 있습니다.',
          code: 'INVALID_TERM_IDS'
        });
      }

      return res.status(500).json({
        success: false,
        message: '약관 동의 저장 중 오류가 발생했습니다.',
        code: 'TERM_AGREEMENT_ERROR'
      });
    }
  }

  /**
   * 위치 검색
   * GET /api/v1/locations/search?keyword={keyword}
   */
  searchLocations = async (req, res) => {
    try {
      logger.info('위치 검색 요청 시작');

      const { keyword } = req.query;

      if (!keyword || keyword.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: '검색 키워드가 필요합니다.',
          code: 'MISSING_KEYWORD'
        });
      }

      const locations = await onboardingService.searchLocations(keyword);

      logger.info('위치 검색 성공', { keyword, resultCount: locations.length });

      return res.status(200).json({
        success: true,
        message: '위치 검색이 완료되었습니다.',
        data: locations
      });

    } catch (error) {
      logger.error('위치 검색 실패:', error);

      return res.status(500).json({
        success: false,
        message: '위치 검색 중 오류가 발생했습니다.',
        code: 'LOCATION_SEARCH_ERROR'
      });
    }
  }

  /**
   * 견종 검색
   * GET /api/v1/breeds/search?keyword={keyword}
   */
  searchBreeds = async (req, res) => {
    try {
      logger.info('견종 검색 요청 시작');

      const { keyword } = req.query;

      const breeds = await onboardingService.searchBreeds(keyword);

      logger.info('견종 검색 성공', { keyword, resultCount: breeds.length });

      return res.status(200).json({
        success: true,
        message: '견종 검색이 완료되었습니다.',
        data: breeds
      });

    } catch (error) {
      logger.error('견종 검색 실패:', error);

      return res.status(500).json({
        success: false,
        message: '견종 검색 중 오류가 발생했습니다.',
        code: 'BREED_SEARCH_ERROR'
      });
    }
  }

  /**
   * 사용자 프로필 업데이트
   * PUT /api/v1/users/me/profile
   */
  updateUserProfile = async (req, res) => {
    try {
      logger.info('사용자 프로필 업데이트 요청 시작');

      const userId = req.user.id; // JWT 미들웨어에서 설정
      const profileData = req.body;

      if (!profileData || Object.keys(profileData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '업데이트할 프로필 데이터가 필요합니다.',
          code: 'MISSING_PROFILE_DATA'
        });
      }

      const updatedProfile = await onboardingService.updateUserProfile(userId, profileData);

      logger.info('사용자 프로필 업데이트 성공', { userId });

      return res.status(200).json({
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: updatedProfile
      });

    } catch (error) {
      logger.error('사용자 프로필 업데이트 실패:', error);

      if (error.message.includes('사용자를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          code: 'USER_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: '프로필 업데이트 중 오류가 발생했습니다.',
        code: 'PROFILE_UPDATE_ERROR'
      });
    }
  }

  /**
   * 사용자 프로필 조회
   * GET /api/v1/users/me/profile
   */
  getUserProfile = async (req, res) => {
    try {
      logger.info('사용자 프로필 조회 요청 시작');

      const userId = req.user.id; // JWT 미들웨어에서 설정

      const profile = await onboardingService.getUserProfile(userId);

      logger.info('사용자 프로필 조회 성공', { userId });

      return res.status(200).json({
        success: true,
        message: '프로필 조회가 완료되었습니다.',
        data: profile
      });

    } catch (error) {
      logger.error('사용자 프로필 조회 실패:', error);

      if (error.message.includes('사용자를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          code: 'USER_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: '프로필 조회 중 오류가 발생했습니다.',
        code: 'PROFILE_FETCH_ERROR'
      });
    }
  }

  /**
   * 사용자 요약 프로필 조회 (메인 화면용)
   * GET /api/v1/users/me/summary-profile
   */
  getUserSummaryProfile = async (req, res) => {
    try {
      logger.info('사용자 요약 프로필 조회 요청 시작');

      const userId = req.user.id; // JWT 미들웨어에서 설정

      const profile = await onboardingService.getUserProfile(userId);

      logger.info('사용자 요약 프로필 조회 성공', { userId });

      return res.status(200).json({
        success: true,
        message: '요약 프로필 조회가 완료되었습니다.',
        data: {
          petName: profile.petName || '반려견',
          petProfileImageUrl: profile.petProfileImageUrl
        }
      });

    } catch (error) {
      logger.error('사용자 요약 프로필 조회 실패:', error);

      if (error.message.includes('사용자를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          code: 'USER_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: '요약 프로필 조회 중 오류가 발생했습니다.',
        code: 'SUMMARY_PROFILE_FETCH_ERROR'
      });
    }
  }
}

module.exports = new OnboardingController();
