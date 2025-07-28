const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/kakao - 카카오 로그인/회원가입
router.post('/kakao', authController.kakaoLogin);

// POST /api/v1/auth/token/refresh - 만료된 액세스 토큰 갱신
router.post('/token/refresh', authController.refreshToken);

module.exports = router;
