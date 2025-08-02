const express = require('express');
const ApiResponse = require('../utils/response');

// 각 도메인별 라우터 import
const courseRoutes = require('./courses');
const markingPhotoRoutes = require('./markingPhotos');
const markingPhotozoneRoutes = require('./markingPhotozones');
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const locationsRoutes = require('./locations');
const breedsRoutes = require('./breeds');

const router = express.Router();

// 라우터 가져오기
const authRoutes = require('./auth');
const userRoutes = require('./users');
const locationRoutes = require('./locations');
const breedRoutes = require('./breeds');
const walkRecordRoutes = require('./walkRecords');
const mapRoutes = require('./map');

// API 버전 1 라우팅
const v1Router = express.Router();

// A. 인증 및 온보딩
v1Router.use('/auth', authRoutes);                    // 카카오 로그인, 토큰 갱신
v1Router.use('/users', userRoutes);                   // 사용자 프로필, 약관 동의
v1Router.use('/locations', locationRoutes);           // 위치 검색
v1Router.use('/breeds', breedRoutes);                 // 견종 검색

// B. 산책 기능
v1Router.use('/walk-records', walkRecordRoutes);      // 산책 기록 관련
v1Router.use('/courses', courseRoutes);               // 코스 관련
v1Router.use('/marking-photos', markingPhotoRoutes);  // 마킹 사진 업로드
v1Router.use('/map', mapRoutes);                      // 지도 정보

// C. 조회 및 관리는 위의 라우터들에 포함됨

// 메인 라우터에 버전 1 등록
//router.use('/api/v1', v1Router);
router.use('/v1', v1Router);

// 헬스 체크 엔드포인트
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '산책명소 백엔드 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 문서 루트
router.get('/api', (req, res) => {
  res.status(200).json({
    message: '🐕 산책명소 API',
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
      map: '/api/v1/map'
    }
  });
});

// 도메인별 라우트 등록
router.use('/v1/courses', courseRoutes);
router.use('/v1/marking-photos', markingPhotoRoutes);
router.use('/v1/marking-photozones', markingPhotozoneRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/users', usersRoutes);
router.use('/v1/locations', locationsRoutes);
router.use('/v1/breeds', breedsRoutes);

module.exports = router;
