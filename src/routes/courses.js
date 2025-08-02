const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken } = require('../middlewares/auth');

// GET /api/v1/courses/recommendations - 우리 동네 추천 코스 요약 목록 조회 (페이징 포함)
router.get('/recommendations', courseController.getRecommendedCourses);

// GET /api/v1/courses/new/details - 새로 생성할 코스의 기본 정보 조회
router.get('/new/details', authenticateToken, courseController.getNewCourseDetails);

// POST /api/v1/courses/new - 새로운 코스 정보 최종 등록 (유일한 코스 생성 API)
router.post('/new', authenticateToken, courseController.createNewCourse);

// GET /api/v1/courses/{course_id} - 선택된 추천 코스의 상세 정보 조회
router.get('/:courseId', courseController.getCourseDetails);

// GET /api/v1/courses/{course_id}/marking-photozones - 산책 중인 코스 내 마킹 포토존 정보 조회
router.get('/:courseId/marking-photozones', courseController.getCoursePhotozones);

module.exports = router;
