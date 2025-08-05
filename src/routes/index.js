const express = require('express');
const router = express.Router();

// 각 도메인별 라우터 import
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const locationsRoutes = require('./locations');
const breedsRoutes = require('./breeds');
const walkRecordRoutes = require('./walkRecords');
const courseRoutes = require('./courses');
const markingPhotoRoutes = require('./markingPhotos');
const markingPhotozoneRoutes = require('./markingPhotozones');

// ===== API v1 라우터 등록 =====

// A. 인증 및 온보딩 API
router.use('/auth', authRoutes);                    // 카카오 로그인, 토큰 갱신
router.use('/users', usersRoutes);                  // 사용자 프로필, 약관 동의
router.use('/locations', locationsRoutes);          // 위치 검색
router.use('/breeds', breedsRoutes);                // 견종 검색

// B. 산책 기능 API
router.use('/walk-records', walkRecordRoutes);      // 산책 기록 관련
router.use('/courses', courseRoutes);               // 코스 관련
router.use('/marking-photos', markingPhotoRoutes);  // 마킹 사진 업로드
router.use('/marking-photozones', markingPhotozoneRoutes); // 마킹 포토존

// ===== 기본 라우터 =====

// API 루트 정보
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🐕 산책명소 백엔드 API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      locations: '/api/v1/locations',
      breeds: '/api/v1/breeds',
      walkRecords: '/api/v1/walk-records',
      courses: '/api/v1/courses',
      markingPhotos: '/api/v1/marking-photos',
      markingPhotozones: '/api/v1/marking-photozones'
    }
  });
});

// 헬스 체크 엔드포인트
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: '산책명소 백엔드 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

module.exports = router;
