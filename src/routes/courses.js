const express = require('express');
const courseController = require('../controllers/courseController');
const { validateCourseQuery } = require('../validations/courseValidation');

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: 코스 목록 조회 (꼬리점수 정렬)
 *     description: 꼬리점수 높은 순으로 정렬된 코스 목록을 조회합니다
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [average_tail_score, created_at, distance]
 *           default: average_tail_score
 *         description: 정렬 기준 필드
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [desc, asc]
 *           default: desc
 *         description: 정렬 순서
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [상, 중, 하]
 *         description: 코스 난이도 필터
 *       - in: query
 *         name: recommended_dog_size
 *         schema:
 *           type: string
 *           enum: [소형, 중형, 대형]
 *         description: 추천 반려견 크기 필터
 *     responses:
 *       200:
 *         description: 코스 목록 조회 성공
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
 *                   example: "코스 목록이 조회되었습니다"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       average_tail_score:
 *                         type: number
 *                         format: decimal
 *                       distance:
 *                         type: number
 *                         format: decimal
 *                       level:
 *                         type: string
 *                         enum: [상, 중, 하]
 *                       recommended_dog_size:
 *                         type: string
 *                         enum: [소형, 중형, 대형]
 *                       thumbnail_image:
 *                         type: string
 *                       creator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           dog_name:
 *                             type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: 잘못된 요청 파라미터
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/', validateCourseQuery, courseController.getCourses);

module.exports = router;
