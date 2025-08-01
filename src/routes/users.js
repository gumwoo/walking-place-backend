const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateJWT } = require('../middlewares/auth');

// POST /api/v1/users/me/terms - 사용자 약관 동의 상태 저장
router.post('/me/terms', authenticateJWT, onboardingController.saveTermAgreements);

// GET /api/v1/users/me/profile - 사용자 프로필 조회
router.get('/me/profile', authenticateJWT, onboardingController.getUserProfile);

// PUT /api/v1/users/me/profile - 사용자 프로필 업데이트
router.put('/me/profile', authenticateJWT, onboardingController.updateUserProfile);

// GET /api/v1/users/me/summary-profile - 사용자 요약 프로필 조회 (메인 화면용)
router.get('/me/summary-profile', authenticateJWT, onboardingController.getUserSummaryProfile);

module.exports = router;
