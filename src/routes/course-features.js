const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseFeature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 코스 특징 고유 ID
 *         name:
 *           type: string
 *           description: 특징 이름
 *           example: "공원"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/course-features:
 *   get:
 *     summary: 코스 특징 목록 조회
 *     description: 모든 코스 특징을 조회합니다 (9가지 특징)
 *     tags: [Course Features]
 *     security: []
 *     responses:
 *       200:
 *         description: 코스 특징 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseFeature'
 *                   example:
 *                     - id: "uuid1"
 *                       name: "공원"
 *                     - id: "uuid2"
 *                       name: "강변"
 *                     - id: "uuid3"
 *                       name: "그늘많음"
 *                     - id: "uuid4"
 *                       name: "경사완만"
 *                     - id: "uuid5"
 *                       name: "넓은공간"
 *                     - id: "uuid6"
 *                       name: "깨끗함"
 *                     - id: "uuid7"
 *                       name: "안전함"
 *                     - id: "uuid8"
 *                       name: "조용함"
 *                     - id: "uuid9"
 *                       name: "접근성좋음"
 *                 message:
 *                   type: string
 *                   example: "코스 특징 목록 조회 성공"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', async (req, res) => {
  try {
    // TODO: 코스 특징 목록 조회 로직 구현
    const features = [
      { id: 'uuid1', name: '공원' },
      { id: 'uuid2', name: '강변' },
      { id: 'uuid3', name: '그늘많음' },
      { id: 'uuid4', name: '경사완만' },
      { id: 'uuid5', name: '넓은공간' },
      { id: 'uuid6', name: '깨끗함' },
      { id: 'uuid7', name: '안전함' },
      { id: 'uuid8', name: '조용함' },
      { id: 'uuid9', name: '접근성좋음' }
    ];

    return ApiResponse.success(res, features, '코스 특징 목록 조회 성공');
  } catch (error) {
    return ApiResponse.serverError(res, '코스 특징 조회 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
