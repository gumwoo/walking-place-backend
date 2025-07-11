const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         dog_name:
 *           type: string
 *           description: 반려견 이름
 *           example: "멍멍이"
 *         dog_breed:
 *           type: string
 *           description: 반려견 품종
 *           example: "골든리트리버"
 *         dog_birth_year:
 *           type: integer
 *           description: 반려견 출생년도
 *           example: 2020
 *         dog_size:
 *           type: string
 *           enum: [소형, 중형, 대형]
 *           description: 반려견 크기
 *           example: "대형"
 *         dog_image:
 *           type: string
 *           description: 반려견 사진 URL
 *           example: "https://example.com/dog.jpg"
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 사용자 프로필 수정
 *     description: 현재 로그인된 사용자의 반려견 정보를 수정합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "프로필이 수정되었습니다"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청
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
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/profile', async (req, res) => {
  try {
    const { dog_name, dog_breed, dog_birth_year, dog_size, dog_image } = req.body;
    
    // TODO: 사용자 프로필 수정 로직 구현
    return ApiResponse.updated(res, {
      id: 'user_uuid',
      dog_name,
      dog_breed,
      dog_birth_year,
      dog_size,
      dog_image
    }, '프로필이 수정되었습니다');
  } catch (error) {
    return ApiResponse.serverError(res, '프로필 수정 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/users/profile/image:
 *   post:
 *     summary: 프로필 이미지 업로드
 *     description: 반려견 프로필 이미지를 업로드합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       description: 업로드된 이미지 URL
 *                       example: "https://example.com/uploads/profile/dog123.jpg"
 *                 message:
 *                   type: string
 *                   example: "이미지가 업로드되었습니다"
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
router.post('/profile/image', async (req, res) => {
  try {
    // TODO: 이미지 업로드 로직 구현 (multer 사용)
    return ApiResponse.created(res, {
      image_url: 'https://example.com/uploads/profile/dog123.jpg'
    }, '이미지가 업로드되었습니다');
  } catch (error) {
    return ApiResponse.serverError(res, '이미지 업로드 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
