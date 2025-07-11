const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     PhotozonePhoto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 포토존 사진 고유 ID
 *         marking_photozone_id:
 *           type: string
 *           format: uuid
 *           description: 마킹포토존 ID
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: 사용자 ID
 *         walk_id:
 *           type: string
 *           format: uuid
 *           description: 산책 기록 ID
 *         file_url:
 *           type: string
 *           description: 사진 파일 URL
 *           example: "https://example.com/uploads/photozone/photo123.jpg"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/photozones/nearby:
 *   get:
 *     summary: 근처 마킹포토존 조회
 *     description: 현재 위치 주변의 마킹포토존을 조회합니다
 *     tags: [Photozones]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 100
 *         description: 반경(미터)
 *         example: 100
 *     responses:
 *       200:
 *         description: 근처 포토존 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarkingPhotozone'
 *                 message:
 *                   type: string
 *                   example: "근처 포토존 조회 성공"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청 (위도/경도 누락)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    
    if (!lat || !lng) {
      return ApiResponse.validationError(res, null, '위도와 경도가 필요합니다');
    }

    // TODO: 근처 마킹포토존 조회 로직 구현
    return ApiResponse.success(res, [
      {
        id: 'photozone_uuid',
        name: '한강뷰 포토존',
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        detection_radius: 20
      }
    ], '근처 포토존 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '포토존 조회 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/photozones/{photozoneId}/photos:
 *   post:
 *     summary: 포토존 사진 업로드
 *     description: 마킹포토존에 사진을 업로드합니다
 *     tags: [Photozones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photozoneId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 마킹포토존 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *               - walk_id
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 사진 파일
 *               walk_id:
 *                 type: string
 *                 format: uuid
 *                 description: 현재 산책 기록 ID
 *     responses:
 *       201:
 *         description: 사진 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PhotozonePhoto'
 *                 message:
 *                   type: string
 *                   example: "포토존 사진이 업로드되었습니다"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청 (파일 형식 오류 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 포토존을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: 파일 크기 초과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:photozoneId/photos', async (req, res) => {
  try {
    const { photozoneId } = req.params;
    const { walk_id } = req.body;
    
    if (!walk_id) {
      return ApiResponse.validationError(res, null, '산책 기록 ID가 필요합니다');
    }

    // TODO: 포토존 사진 업로드 로직 구현 (multer 사용)
    return ApiResponse.created(res, {
      id: 'new_photo_uuid',
      marking_photozone_id: photozoneId,
      walk_id,
      file_url: 'https://example.com/uploads/photozone/photo123.jpg'
    }, '포토존 사진이 업로드되었습니다');
  } catch (error) {
    return ApiResponse.serverError(res, '사진 업로드 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/photozones/{photozoneId}/photos:
 *   get:
 *     summary: 포토존 사진 조회
 *     description: 특정 마킹포토존에 업로드된 모든 사진을 조회합니다
 *     tags: [Photozones]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: photozoneId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 마킹포토존 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 포토존 사진 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       404:
 *         description: 포토존을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:photozoneId/photos', async (req, res) => {
  try {
    const { photozoneId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // TODO: 포토존 사진 조회 로직 구현
    return ApiResponse.success(res, [
      {
        id: 'photo_uuid',
        file_url: 'https://example.com/uploads/photozone/photo123.jpg',
        user_id: 'user_uuid',
        created_at: new Date().toISOString()
      }
    ], '포토존 사진 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '사진 조회 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
