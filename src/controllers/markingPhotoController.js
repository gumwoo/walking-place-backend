// C:\walking-backend\src\controllers\markingPhotoController.js

const markingPhotoService = require('../services/markingPhotoService');
const markingPhotozoneService = require('../services/markingPhotozoneService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 *   name: MarkingPhotos
 *   description: 마킹 포토 및 포토존 관련 API
 * components:
 *   schemas:
 *     MarkingPhotozone:
 *       type: object
 *       properties:
 *         photozone_id:
 *           type: string
 *           format: uuid
 *           description: 마킹 포토존 고유 ID
 *         latitude:
 *           type: number
 *           format: double
 *           description: 포토존 위도
 *         longitude:
 *           type: number
 *           format: double
 *           description: 포토존 경도
 *         course_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: 코스 ID (특정 코스에 속하지 않을 수 있음)
 *         is_recommended:
 *           type: boolean
 *           description: 추천 포토존 여부
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 수정 일시
 *       example:
 *         photozone_id: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
 *         latitude: 37.5665
 *         longitude: 126.9780
 *         course_id: null
 *         is_recommended: false
 *         created_at: "2023-10-27T10:00:00Z"
 *         updated_at: "2023-10-27T10:00:00Z"
 *     MarkingPhoto:
 *       type: object
 *       properties:
 *         photo_id:
 *           type: string
 *           format: uuid
 *           description: 마킹 포토 고유 ID
 *         photo_url:
 *           type: string
 *           description: 사진 URL
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *       example:
 *         photo_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         photo_url: "http://example.com/photo1.jpg"
 *         created_at: "2023-10-27T10:05:00Z"
 *     PhotozoneDetailsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             photozone:
 *               $ref: '#/components/schemas/MarkingPhotozone'
 *             photos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MarkingPhoto'
 *             is_marked_by_user:
 *               type: boolean
 *               description: 현재 사용자가 이 포토존에 사진을 마킹했는지 여부
 *       example:
 *         success: true
 *         message: "포토존 상세 정보를 성공적으로 조회했습니다."
 *         data:
 *           photozone:
 *             photozone_id: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
 *             latitude: 37.5665
 *             longitude: 126.9780
 *             is_recommended: false
 *           photos:
 *             - photo_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               photo_url: "http://example.com/photo1.jpg"
 *               created_at: "2023-10-27T10:05:00Z"
 *           is_marked_by_user: false
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *       example:
 *         success: true
 *         message: "요청이 성공적으로 처리되었습니다."
 *         data:
 *           id: "uuid-example"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         code:
 *           type: string
 *       example:
 *         success: false
 *         message: "요청 처리 중 오류가 발생했습니다."
 *         code: "ERROR_CODE"
 */
class MarkingPhotoController {
  
  /**
   * @swagger
   * /api/v1/marking-photos:
   *   post:
   *     tags: [MarkingPhotos]
   *     summary: 새로운 마킹 포인트 등록
   *     description: "산책 중 마킹 버튼을 눌러 새로운 포토존을 생성하고 사진을 등록합니다."
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - walkRecordId
   *               - latitude
   *               - longitude
   *               - photoUrl
   *             properties:
   *               walkRecordId:
   *                 type: string
   *                 format: uuid
   *                 description: 산책 기록 고유 ID
   *                 example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
   *               latitude:
   *                 type: number
   *                 format: double
   *                 description: 사진을 찍은 위치의 위도
   *                 example: 37.5665
   *               longitude:
   *                 type: number
   *                 format: double
   *                 description: 사진을 찍은 위치의 경도
   *                 example: 126.9780
   *               photoUrl:
   *                 type: string
   *                 description: 업로드된 사진의 URL
   *                 example: "https://example.com/photos/123.jpg"
   *     responses:
   *       '201':
   *         description: 마킹 포인트 등록 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: "마킹 포인트가 성공적으로 등록되었습니다."
   *               data:
   *                 markingPhotoId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   *                 photozoneId: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
   *       '400':
   *         description: 잘못된 요청 (필수 필드 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 산책 기록을 찾을 수 없음
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
  async createMarkingPoint(req, res) {
    try {
      logger.info('새로운 마킹 포인트 등록 요청 시작');
      
      const userId = req.user.user_id;
      const { walkRecordId, latitude, longitude, photoUrl } = req.body;
      
      if (!walkRecordId || !latitude || !longitude || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: '산책 기록 ID, 위도, 경도, 사진 URL이 필요합니다.',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const result = await markingPhotoService.createMarkingPoint({
        userId,
        walkRecordId,
        latitude,
        longitude,
        photoUrl
      });
      
      logger.info('새로운 마킹 포인트 등록 성공', { 
        userId, 
        markingPhotoId: result.markingPhotoId 
      });
      
      return res.status(201).json({
        success: true,
        message: '마킹 포인트가 성공적으로 등록되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('새로운 마킹 포인트 등록 실패:', error);
      
      if (error.message.includes('산책 기록을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'WALK_RECORD_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '마킹 포인트 등록 중 오류가 발생했습니다.',
        code: 'CREATE_MARKING_POINT_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/marking-photozones/{photozoneId}:
   *   get:
   *     tags: [MarkingPhotos]
   *     summary: 마킹 포토존 상세 정보 조회
   *     description: "포토존 ID를 통해 포토존의 상세 정보와 해당 포토존에 등록된 모든 사진을 조회합니다."
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: photozoneId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 조회할 마킹 포토존의 고유 ID
   *           example: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
   *     responses:
   *       '200':
   *         description: 포토존 상세 정보 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PhotozoneDetailsResponse'
   *       '400':
   *         description: 잘못된 요청 (포토존 ID 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 포토존을 찾을 수 없음
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
  async getPhotozoneDetails(req, res) {
    try {
      logger.info('마킹 포토존 상세 정보 조회 요청 시작');
      
      const { photozoneId } = req.params;
      const userId = req.user.user_id; 
      
      if (!photozoneId) {
        return res.status(400).json({
          success: false,
          message: '포토존 ID가 필요합니다.',
          code: 'MISSING_PHOTOZONE_ID'
        });
      }

      const result = await markingPhotozoneService.getPhotozoneDetails(photozoneId, userId);
      
      logger.info('마킹 포토존 상세 정보 조회 성공', { photozoneId });
      
      return res.status(200).json({
        success: true,
        message: '포토존 상세 정보를 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('마킹 포토존 상세 정보 조회 실패:', error);
      
      if (error.message.includes('포토존을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'PHOTOZONE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '포토존 상세 정보 조회 중 오류가 발생했습니다.',
        code: 'GET_PHOTOZONE_DETAILS_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/marking-photozones/{photozoneId}/photos:
   *   post:
   *     tags: [MarkingPhotos]
   *     summary: 기존 마킹 포토존에 사진 추가
   *     description: "이미 존재하는 포토존에 새로운 사진을 추가합니다."
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: photozoneId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 사진을 추가할 마킹 포토존의 고유 ID
   *           example: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - photoUrl
   *               - walkRecordId
   *             properties:
   *               photoUrl:
   *                 type: string
   *                 description: 업로드된 사진의 URL
   *                 example: "https://example.com/photos/456.jpg"
   *               walkRecordId:
   *                 type: string
   *                 format: uuid
   *                 description: 산책 기록 고유 ID
   *                 example: "1a2b3c4d-5e6f-7890-1234-567890abcdef"
   *     responses:
   *       '201':
   *         description: 포토존에 사진 추가 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: "포토존에 사진이 성공적으로 추가되었습니다."
   *               data:
   *                 photoId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   *                 photozoneId: "7d6480c0-6218-472d-8b06-444c18f6d6f2"
   *       '400':
   *         description: 잘못된 요청 (필수 필드 누락)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 포토존을 찾을 수 없음
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
  async addPhotoToPhotozone(req, res) {
    try {
      logger.info('기존 포토존에 사진 추가 요청 시작');
      
      const { photozoneId } = req.params;
      const { photoUrl, walkRecordId } = req.body; 
      const userId = req.user.user_id;
      
      if (!photozoneId || !photoUrl || !walkRecordId) {
        return res.status(400).json({
          success: false,
          message: '포토존 ID, 사진 URL, 산책 기록 ID가 필요합니다.',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const result = await markingPhotozoneService.addPhotoToPhotozone(
        photozoneId, 
        photoUrl,
        walkRecordId,
        userId
      );
      
      logger.info('기존 포토존에 사진 추가 성공', { 
        photozoneId,
        photoId: result.photoId 
      });
      
      return res.status(201).json({
        success: true,
        message: '포토존에 사진이 성공적으로 추가되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('기존 포토존에 사진 추가 실패:', error);
      
      if (error.message.includes('포토존을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'PHOTOZONE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '포토존에 사진 추가 중 오류가 발생했습니다.',
        code: 'ADD_PHOTO_TO_PHOTOZONE_ERROR'
      });
    }
  }
}

module.exports = new MarkingPhotoController();
