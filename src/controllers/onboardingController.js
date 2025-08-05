// C:\walking-backend\src\controllers\onboardingController.js

const onboardingService = require('../services/onboardingService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: "온보딩 과정에서 필요한 API (위치/견종 검색)"
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         location_id:
 *           type: string
 *           format: uuid
 *           example: "8b23c2d6-4e58-4c17-9c98-15c0e1763c32"
 *           description: 위치 고유 ID
 *         name:
 *           type: string
 *           example: "강남구"
 *           description: "위치 이름 (예: 구 이름)"
 *     Breed:
 *       type: object
 *       properties:
 *         breed_id:
 *           type: string
 *           format: uuid
 *           example: "b1f8b7d4-8d4e-4f0e-8c38-8e6f1f4b8f3e"
 *           description: 견종 고유 ID
 *         name:
 *           type: string
 *           example: "푸들"
 *           description: 견종 이름
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
class OnboardingController {

  /**
   * @swagger
   * /api/v1/locations/search:
   *   get:
   *     tags: [Onboarding]
   *     summary: 위치 검색
   *     description: "사용자가 선호하는 위치를 검색합니다."
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         schema:
   *           type: string
   *           description: 검색할 위치 키워드
   *           example: "강남"
   *     responses:
   *       '200':
   *         description: 위치 검색 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "위치 검색이 완료되었습니다."
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Location'
   *       '400':
   *         description: "잘못된 요청 (키워드 누락)"
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async searchLocations(req, res) {
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
   * @swagger
   * /api/v1/breeds/search:
   *   get:
   *     tags: [Onboarding]
   *     summary: 견종 검색
   *     description: "사용자가 반려견의 견종을 검색합니다."
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: false
   *         schema:
   *           type: string
   *           description: "검색할 견종 키워드 (선택 사항)"
   *           example: "푸들"
   *     responses:
   *       '200':
   *         description: 견종 검색 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "견종 검색이 완료되었습니다."
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Breed'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async searchBreeds(req, res) {
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
}

module.exports = new OnboardingController();
