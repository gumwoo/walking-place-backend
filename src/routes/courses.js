const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 코스 고유 ID
 *         creator_id:
 *           type: string
 *           format: uuid
 *           description: 코스 생성자 ID
 *         title:
 *           type: string
 *           description: 코스명
 *           example: "한강공원 산책로"
 *         distance:
 *           type: number
 *           format: decimal
 *           description: 거리(km)
 *           example: 2.5
 *         level:
 *           type: string
 *           enum: [상, 중, 하]
 *           description: 난이도
 *           example: "중"
 *         recommended_dog_size:
 *           type: string
 *           enum: [소형, 중형, 대형]
 *           description: 추천 견종
 *           example: "대형"
 *         average_tail_score:
 *           type: number
 *           format: decimal
 *           description: 평균 꼬리점수
 *           example: 4.2
 *         estimated_time:
 *           type: integer
 *           description: 예상 시간(분)
 *           example: 30
 *         thumbnail_image:
 *           type: string
 *           description: 썸네일 이미지 URL
 *         course_image:
 *           type: string
 *           description: 코스 상세 이미지 URL
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: 코스 특징
 *           example: ["공원", "강변", "그늘많음"]
 *         marking_photozones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MarkingPhotozone'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     MarkingPhotozone:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           description: 포토존 이름
 *           example: "한강뷰 포토존"
 *         location:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *               example: 37.5665
 *             lng:
 *               type: number
 *               example: 126.9780
 *         detection_radius:
 *           type: integer
 *           description: 감지 반경(미터)
 *           example: 20
 *     
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - title
 *         - level
 *         - path_coordinates
 *       properties:
 *         title:
 *           type: string
 *           description: 코스명
 *           example: "새로운 산책로"
 *         distance:
 *           type: number
 *           description: 거리(km)
 *           example: 2.5
 *         level:
 *           type: string
 *           enum: [상, 중, 하]
 *           description: 난이도
 *           example: "중"
 *         recommended_dog_size:
 *           type: string
 *           enum: [소형, 중형, 대형]
 *           description: 추천 견종
 *           example: "중형"
 *         estimated_time:
 *           type: integer
 *           description: 예상 시간(분)
 *           example: 30
 *         thumbnail_image:
 *           type: string
 *           description: 썸네일 이미지 URL
 *         course_image:
 *           type: string
 *           description: 코스 상세 이미지 URL
 *         path_coordinates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 37.5665
 *               lng:
 *                 type: number
 *                 example: 126.9780
 *           description: 경로 좌표 배열
 *         feature_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: 코스 특징 ID 배열
 *         marking_photozones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "포토존1"
 *               lat:
 *                 type: number
 *                 example: 37.5670
 *               lng:
 *                 type: number
 *                 example: 126.9785
 *           description: 마킹포토존 정보
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: 코스 목록 조회 (꼬리점수 높은 순)
 *     description: 주변 코스를 꼬리점수 높은 순으로 조회합니다
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: double
 *         description: 위도
 *         example: 37.5665
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: double
 *         description: 경도
 *         example: 126.9780
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: 반경(km)
 *         example: 5
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [상, 중, 하]
 *         description: 난이도 필터
 *       - in: query
 *         name: dog_size
 *         schema:
 *           type: string
 *           enum: [소형, 중형, 대형]
 *         description: 추천 견종 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 코스 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: 잘못된 요청
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
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5, level, dog_size, page = 1, limit = 10 } = req.query;
    
    // TODO: 코스 목록 조회 로직 구현
    return ApiResponse.success(res, [
      {
        id: 'course_uuid',
        title: '한강공원 산책로',
        distance: 2.5,
        level: '중',
        average_tail_score: 4.2,
        thumbnail_image: 'https://example.com/thumb.jpg'
      }
    ], '코스 목록 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '코스 목록 조회 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     summary: 코스 상세 조회
 *     description: 특정 코스의 상세 정보를 조회합니다
 *     tags: [Courses]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 코스 ID
 *     responses:
 *       200:
 *         description: 코스 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: "코스 상세 조회 성공"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 코스를 찾을 수 없음
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
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // TODO: 코스 상세 조회 로직 구현
    return ApiResponse.success(res, {
      id: courseId,
      title: '한강공원 산책로',
      distance: 2.5,
      level: '중',
      average_tail_score: 4.2,
      features: ['공원', '강변', '그늘많음'],
      marking_photozones: []
    }, '코스 상세 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '코스 상세 조회 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: 코스 등록
 *     description: 새로운 산책 코스를 등록합니다
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: 코스 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: "코스가 등록되었습니다"
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
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      distance, 
      level, 
      recommended_dog_size, 
      estimated_time,
      thumbnail_image,
      course_image,
      path_coordinates,
      feature_ids,
      marking_photozones
    } = req.body;
    
    if (!title || !level || !path_coordinates) {
      return ApiResponse.validationError(res, null, '필수 필드가 누락되었습니다');
    }

    // TODO: 코스 등록 로직 구현
    return ApiResponse.created(res, {
      id: 'new_course_uuid',
      title,
      distance,
      level,
      recommended_dog_size,
      estimated_time,
      thumbnail_image,
      course_image
    }, '코스가 등록되었습니다');
  } catch (error) {
    return ApiResponse.serverError(res, '코스 등록 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/courses/my:
 *   get:
 *     summary: 내가 만든 코스 조회
 *     description: 현재 로그인된 사용자가 생성한 코스 목록을 조회합니다
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 내 코스 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
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
router.get('/my', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // TODO: 내가 만든 코스 조회 로직 구현
    return ApiResponse.success(res, [], '내 코스 목록 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '내 코스 조회 중 오류가 발생했습니다', error);
  }
});

/**
 * @swagger
 * /api/courses/{courseId}/report:
 *   post:
 *     summary: 코스 신고
 *     description: 부적절한 코스를 신고합니다
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 신고할 코스 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_reason
 *             properties:
 *               report_reason:
 *                 type: string
 *                 description: 신고 사유
 *                 example: "부적절한 경로"
 *     responses:
 *       200:
 *         description: 신고 접수 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "신고가 접수되었습니다"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 잘못된 요청 (이미 신고한 코스 등)
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
 *       404:
 *         description: 코스를 찾을 수 없음
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
router.post('/:courseId/report', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { report_reason } = req.body;
    
    if (!report_reason) {
      return ApiResponse.validationError(res, null, '신고 사유를 입력해주세요');
    }

    // TODO: 코스 신고 로직 구현
    return ApiResponse.success(res, null, '신고가 접수되었습니다');
  } catch (error) {
    return ApiResponse.serverError(res, '신고 처리 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
