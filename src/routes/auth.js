const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - accessToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: OAuth 액세스 토큰
 *           example: "ya29.a0ARrdaM9..."
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT 토큰
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *           example: "로그인 성공"
 *         timestamp:
 *           type: string
 *           format: date-time
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 사용자 고유 ID
 *         oauth_provider:
 *           type: string
 *           enum: [kakao, google]
 *           description: OAuth 제공자
 *         oauth_id:
 *           type: string
 *           description: OAuth 제공자별 사용자 ID
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
 *         dog_image:
 *           type: string
 *           description: 반려견 사진 URL
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/oauth/kakao:
 *   post:
 *     summary: 카카오 OAuth 로그인
 *     description: 카카오 액세스 토큰을 사용하여 로그인합니다
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
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
router.post('/oauth/kakao', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return ApiResponse.validationError(res, null, '액세스 토큰이 필요합니다');
    }

    // TODO: 카카오 OAuth 로그인 로직 구현
    return ApiResponse.success(res, {
      token: 'jwt_token_here',
      user: {
        id: 'user_uuid',
        oauth_provider: 'kakao',
        oauth_id: 'kakao_user_id'
      }
    }, '로그인 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '로그인 처리 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/auth/oauth/google:
 *   post:
 *     summary: 구글 OAuth 로그인
 *     description: 구글 액세스 토큰을 사용하여 로그인합니다
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
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
router.post('/oauth/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return ApiResponse.validationError(res, null, '액세스 토큰이 필요합니다');
    }

    // TODO: 구글 OAuth 로그인 로직 구현
    return ApiResponse.success(res, {
      token: 'jwt_token_here',
      user: {
        id: 'user_uuid',
        oauth_provider: 'google',
        oauth_id: 'google_user_id'
      }
    }, '로그인 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '로그인 처리 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 현재 사용자 프로필 조회
 *     description: JWT 토큰으로 현재 로그인된 사용자의 프로필을 조회합니다
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
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
 *                   example: "프로필 조회 성공"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
router.get('/profile', async (req, res) => {
  try {
    // TODO: JWT 토큰 검증 및 사용자 정보 조회 로직 구현
    return ApiResponse.success(res, {
      id: 'user_uuid',
      oauth_provider: 'kakao',
      dog_name: '멍멍이',
      dog_breed: '골든리트리버'
    }, '프로필 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '프로필 조회 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
