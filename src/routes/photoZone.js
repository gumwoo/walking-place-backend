const express = require('express');
const router = express.Router();
const photoZoneController = require('../controllers/photoZoneController');
const imageUploadService = require('../services/imageUploadService');
const PhotoZoneValidation = require('../middlewares/photoZoneValidation');

// 이미지 업로드 미들웨어 설정
const upload = imageUploadService.getMulterInstance();

/**
 * @swagger
 * /api/photo-zone/nearby:
 *   get:
 *     summary: 근처 포토존 조회
 *     description: 사용자 위치 기준 근처 포토존들을 거리순으로 조회합니다
 *     tags: [PhotoZone]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 1000
 *           maximum: 5000
 *         description: 검색 반경 (미터, 최대 5km)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: 조회 개수 제한 (최대 50개)
 *     responses:
 *       200:
 *         description: 근처 포토존 조회 성공
 *       400:
 *         description: 잘못된 요청 (위치 정보 누락 또는 잘못된 형식)
 *       500:
 *         description: 서버 오류
 */
router.get('/nearby', 
  PhotoZoneValidation.validateLocation,
  PhotoZoneValidation.validateSearchParams,
  photoZoneController.getNearbyPhotoZones
);

/**
 * @swagger
 * /api/photo-zone/upload:
 *   post:
 *     summary: 포토존 사진 업로드
 *     description: 포토존 감지 범위 내에서 사진을 업로드합니다
 *     tags: [PhotoZone]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photozone_id
 *               - walk_id
 *               - user_latitude
 *               - user_longitude
 *               - photo
 *             properties:
 *               photozone_id:
 *                 type: string
 *                 format: uuid
 *                 description: 포토존 ID
 *               walk_id:
 *                 type: string
 *                 format: uuid
 *                 description: 현재 진행 중인 산책 ID
 *               user_latitude:
 *                 type: number
 *                 format: float
 *                 description: 사용자 현재 위도
 *               user_longitude:
 *                 type: number
 *                 format: float
 *                 description: 사용자 현재 경도
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 사진 파일 (JPEG, PNG, WebP, 최대 10MB)
 *     responses:
 *       201:
 *         description: 사진 업로드 성공
 *       400:
 *         description: 잘못된 요청 (범위 밖, 파일 누락 등)
 *       404:
 *         description: 포토존을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/upload',
  upload.single('photo'),
  PhotoZoneValidation.validateFileUpload,
  PhotoZoneValidation.validateUploadFields,
  photoZoneController.uploadPhotozonePhoto
);

/**
 * @swagger
 * /api/photo-zone/photos:
 *   get:
 *     summary: 업로드된 사진들 조회
 *     description: 특정 포토존에 업로드된 사진들을 최신순으로 조회합니다
 *     tags: [PhotoZone]
 *     parameters:
 *       - in: query
 *         name: photozone_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 포토존 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 50
 *         description: 페이지당 개수 (최대 50개)
 *     responses:
 *       200:
 *         description: 사진 목록 조회 성공
 *       400:
 *         description: 잘못된 요청 (포토존 ID 누락)
 *       404:
 *         description: 포토존을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/photos',
  PhotoZoneValidation.validateUUIDs(['photozone_id']),
  PhotoZoneValidation.validatePagination,
  photoZoneController.getPhotozonePhotos
);

module.exports = router;
