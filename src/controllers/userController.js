// C:\walking-backend\src\controllers\userController.js

const userService = require('../services/userService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 API
 * components:
 *   schemas:
 *     AgreeToTermsRequest:
 *       type: object
 *       required:
 *         - agreedTermIds
 *       properties:
 *         agreedTermIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example: ["e4b6d4f9-7f9a-4e2b-b8c7-4d7a8d5f6b2d", "a9c7b8e5-3d8b-4a4f-9e6e-2c9b6e8a4d7c"]
 *           description: 동의한 약관 ID 목록
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         petName:
 *           type: string
 *           example: "해피"
 *           description: 반려동물 이름
 *         dogBreedId:
 *           type: string
 *           format: uuid
 *           example: "d4e2f8c5-9f5c-4d3e-9b8f-3a2c4e9d7b4c"
 *           description: 견종 ID
 *         preferredLocationId:
 *           type: string
 *           format: uuid
 *           example: "c4b3a2d1-0e9f-8c7b-6a5d-4e3f2c1b0a9d"
 *           description: 선호 위치 ID
 *     ProfileSummary:
 *       type: object
 *       properties:
 *         petName:
 *           type: string
 *           example: "해피"
 *           description: 반려동물 이름
 *         petProfileImageUrl:
 *           type: string
 *           example: "https://example.com/profile/happy.jpg"
 *           description: 반려동물 프로필 이미지 URL
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "d4e2f8c5-9f5c-4d3e-9b8f-3a2c4e9d7b4c"
 *           description: 사용자 ID
 *         petName:
 *           type: string
 *           example: "해피"
 *           description: 반려동물 이름
 *         dogBreed:
 *           type: object
 *           properties:
 *             breed_id:
 *               type: string
 *               format: uuid
 *               example: "b1f8b7d4-8d4e-4f0e-8c38-8e6f1f4b8f3e"
 *             name:
 *               type: string
 *               example: "푸들"
 *         preferredLocation:
 *           type: object
 *           properties:
 *             location_id:
 *               type: string
 *               format: uuid
 *               example: "8b23c2d6-4e58-4c17-9c98-15c0e1763c32"
 *             name:
 *               type: string
 *               example: "강남구"
 *         isTermsAgreed:
 *           type: boolean
 *           example: true
 *           description: 필수 약관 동의 여부
 *     WalkRecord:
 *       type: object
 *       properties:
 *         walk_record_id:
 *           type: string
 *           format: uuid
 *           example: "e4b6d4f9-7f9a-4e2b-b8c7-4d7a8d5f6b2d"
 *           description: 산책 기록 ID
 *         duration:
 *           type: integer
 *           example: 3600
 *           description: "산책 시간 (초 단위)"
 *         distance:
 *           type: number
 *           example: 5.2
 *           description: "산책 거리 (km 단위)"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-10-27T10:00:00Z"
 *           description: 산책 기록 일시
 *     WalkRecordsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "산책 기록 목록이 조회되었습니다."
 *         data:
 *           type: object
 *           properties:
 *             records:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WalkRecord'
 *             pagination:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                   example: 50
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "요청이 성공적으로 처리되었습니다."
 *         data:
 *           type: object
 *           example: {}
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "오류 메시지"
 *         code:
 *           type: string
 *           example: "ERROR_CODE"
 */
class UserController {
  /**
   * @swagger
   * /api/v1/users/me/terms:
   *   post:
   *     tags: [Users]
   *     summary: 사용자 약관 동의 상태 저장
   *     description: "사용자가 동의한 약관 ID 목록을 저장합니다."
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AgreeToTermsRequest'
   *     responses:
   *       '200':
   *         description: 약관 동의 저장 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: "약관 동의가 저장되었습니다."
   *       '400':
   *         description: "잘못된 요청 (필수 필드 누락)"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async agreeToTerms(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID; 
      logger.info('약관 동의 요청 시작', { userId });
      
      const { agreedTermIds } = req.body;
      
      if (!agreedTermIds || !Array.isArray(agreedTermIds)) {
        return res.status(400).json({
          success: false,
          message: '동의한 약관 ID 목록이 필요합니다.',
          code: 'MISSING_AGREED_TERMS'
        });
      }

      await userService.agreeToTerms(userId, agreedTermIds);
      
      logger.info('약관 동의 완료', { userId });
      
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
   * @swagger
   * /api/v1/users/me/profile:
   *   put:
   *     tags: [Users]
   *     summary: 사용자 프로필 업데이트
   *     description: "반려동물 정보, 선호 위치 등 사용자의 프로필 정보를 업데이트합니다."
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileRequest'
   *     responses:
   *       '200':
   *         description: 프로필 업데이트 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: "프로필이 업데이트되었습니다."
   *               data:
   *                 isProfileSetupCompleted: true
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID; 
      logger.info('프로필 업데이트 요청 시작', { userId });
      
      const updateData = req.body;
      const updatedUser = await userService.updateProfile(userId, updateData);
      
      logger.info('프로필 업데이트 완료', { userId });
      
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
   * @swagger
   * /api/v1/users/me/summary-profile:
   *   get:
   *     tags: [Users]
   *     summary: 대표 반려동물 이름 및 아이콘 정보 조회 (메인 화면용)
   *     description: "메인 화면에 표시할 사용자의 간단한 프로필 정보를 조회합니다."
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: 요약 프로필 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ProfileSummary'
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getSummaryProfile(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
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
   * @swagger
   * /api/v1/users/me/profile:
   *   get:
   *     tags: [Users]
   *     summary: 사용자 및 반려동물 프로필 정보 조회
   *     description: "마이페이지 또는 프로필 편집 화면에서 사용할 상세 프로필 정보를 조회합니다."
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: 상세 프로필 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getProfile(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
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
   * @swagger
   * /api/v1/users/me/walk-records:
   *   get:
   *     tags: [Users]
   *     summary: 사용자의 모든 산책 기록 목록 조회
   *     description: "사용자가 기록한 산책 기록의 목록을 페이지네이션과 함께 조회합니다."
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           description: "페이지 번호 (기본값: 1)"
   *           example: 1
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           minimum: 1
   *           description: "페이지당 항목 수 (기본값: 10)"
   *           example: 10
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [created_at, distance, duration]
   *           description: "정렬 기준 (기본값: created_at)"
   *           example: "created_at"
   *     responses:
   *       '200':
   *         description: 산책 기록 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WalkRecordsResponse'
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getWalkRecords(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
      const { page = 1, size = 10, sortBy = 'created_at' } = req.query;

      const result = await userService.getWalkRecords(userId, {
        page: parseInt(page, 10),
        size: parseInt(size, 10),
        sortBy,
      });

      return res.status(200).json({
        success: true,
        message: '산책 기록 목록이 조회되었습니다.',
        data: result,
      });
    } catch (error) {
      logger.error('산책 기록 목록 조회 실패', { error: error.message });

      return res.status(500).json({
        success: false,
        message: '산책 기록 조회 중 오류가 발생했습니다.',
        code: 'WALK_RECORDS_GET_ERROR',
      });
    }
  }
}

module.exports = new UserController();
