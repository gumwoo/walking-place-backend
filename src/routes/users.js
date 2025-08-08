const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/v1/users/me/terms - 사용자 약관 동의 상태 저장
router.post('/me/terms', authenticateToken, userController.agreeToTerms);

// PUT /api/v1/users/me/profile - 사용자 프로필 업데이트 (위치/반려동물 정보)
router.put('/me/profile', authenticateToken, userController.updateProfile);
// GET /api/v1/users/terms - 약관 목록 조회
router.get('/terms', userController.getTerms);
// GET /api/v1/users/me/summary-profile - 대표 반려동물 이름 및 아이콘 정보 조회
router.get('/me/summary-profile', authenticateToken, userController.getSummaryProfile);

// GET /api/v1/users/me/profile - 사용자 및 반려동물 프로필 정보 조회 (마이 프로필/프로필 편집)
router.get('/me/profile', authenticateToken, userController.getProfile);

// GET /api/v1/users/me/walk-records - 사용자의 모든 산책 기록 목록 조회
router.get('/me/walk-records', authenticateToken, userController.getWalkRecords);

module.exports = router;
