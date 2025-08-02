const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/v1/auth/kakao - 카카오 로그인/회원가입
router.post('/kakao', authController.kakaoLogin);

// GET /api/v1/auth/kakao/callback - 카카오 OAuth 콜백
router.get('/kakao/callback', authController.kakaoCallback);

// POST /api/v1/auth/token/refresh - 액세스 토큰 갱신
router.post('/token/refresh', authController.refreshToken);

// POST /api/v1/auth/logout - 로그아웃
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
