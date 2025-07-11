const express = require('express');
const router = express.Router();
const { matchWalkPath } = require('../services/walkService');
const { analyze20mDeviations } = require('../services/walkPathRefinementService');
const { Walk } = require('../models');
const ApiResponse = require('../utils/response');

/**
 * @swagger
 * components:
 *   schemas:
 *     Walk:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: 산책 기록 고유 ID
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: 사용자 ID
 *         course_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: 코스 ID (자유 산책시 null)
 *         title:
 *           type: string
 *           description: 산책 제목
 *           example: "오늘의 산책"
 *         walk_date:
 *           type: string
 *           format: date
 *           description: 산책 날짜
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: 시작 시간
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: 종료 시간
 *         total_distance:
 *           type: number
 *           format: decimal
 *           description: 총 거리(km)
 *           example: 2.5
 *         total_time:
 *           type: integer
 *           description: 총 시간(초)
 *           example: 1800
 *         marking_count:
 *           type: integer
 *           description: 마킹 횟수
 *           example: 3
 *         tail_score:
 *           type: integer
 *           description: 꼬리점수
 *           example: 4
 *         status:
 *           type: string
 *           enum: [started, completed, cancelled]
 *           description: 산책 상태
 *         raw_coordinates:
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
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *           description: 원본 GPS 좌표 배열
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/walks/{id}/coordinate:
 *   post:
 *     summary: 실시간 GPS 좌표 추가
 *     description: 산책 중 실시간으로 GPS 좌표를 추가합니다
 *     tags: [Walks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 산책 기록 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *               - timestamp
 *             properties:
 *               lat:
 *                 type: number
 *                 format: double
 *                 description: 위도
 *                 example: 37.5665
 *               lng:
 *                 type: number
 *                 format: double
 *                 description: 경도
 *                 example: 126.9780
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: 좌표 기록 시간
 *                 example: "2025-07-11T10:30:00Z"
 *     responses:
 *       200:
 *         description: 좌표 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 산책 기록을 찾을 수 없음
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
// 좌표 추가
router.post('/:id/coordinate', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    if (!walk) return ApiResponse.notFound(res, '산책 기록을 찾을 수 없습니다');

    const { lat, lng, timestamp } = req.body;
    if (!lat || !lng || !timestamp) {
      return ApiResponse.validationError(res, null, '좌표(lat, lng, timestamp)가 올바르지 않습니다');
    }

    const newCoord = { lat, lng, timestamp };
    const updatedCoords = walk.raw_coordinates ? [...walk.raw_coordinates, newCoord] : [newCoord];

    walk.raw_coordinates = updatedCoords;
    await walk.save();

    return ApiResponse.updated(res, walk.raw_coordinates, '좌표가 추가되었습니다');
  } catch (err) {
    console.error(err);
    return ApiResponse.serverError(res, '좌표 추가 중 서버 오류가 발생했습니다', err);
  }
});

/**
 * @swagger
 * /api/walks/{id}/coordinates:
 *   get:
 *     summary: 산책 중 좌표 조회
 *     description: 실시간 폴리라인 표시를 위한 현재 산책의 GPS 좌표를 조회합니다
 *     tags: [Walks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 산책 기록 ID
 *     responses:
 *       200:
 *         description: 좌표 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 산책 기록을 찾을 수 없음
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
// 산책 중 좌표 조회 (프론트 실시간 폴리라인용)
router.get('/:id/coordinates', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    if (!walk) return ApiResponse.notFound(res, '산책 기록을 찾을 수 없습니다');

    return ApiResponse.success(res, walk.raw_coordinates || [], '좌표 조회 성공');
  } catch (err) {
    console.error(err);
    return ApiResponse.serverError(res, '좌표 조회 중 서버 오류가 발생했습니다', err);
  }
});

/**
 * @swagger
 * /api/walks/{id}/finish:
 *   post:
 *     summary: 산책 종료 및 경로 분석
 *     description: 산책을 종료하고 GPS 경로 매칭 알고리즘을 실행합니다
 *     tags: [Walks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 산책 기록 ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_distance:
 *                 type: number
 *                 format: decimal
 *                 description: 총 거리(km)
 *                 example: 2.5
 *               total_time:
 *                 type: integer
 *                 description: 총 시간(초)
 *                 example: 1800
 *               marking_count:
 *                 type: integer
 *                 description: 마킹 횟수
 *                 example: 3
 *               tail_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 꼬리점수 (1-5)
 *                 example: 4
 *     responses:
 *       200:
 *         description: 산책 종료 및 분석 완료
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 잘못된 요청 (이미 완료된 산책 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 산책 기록을 찾을 수 없음
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
// 산책 종료 + 경로 매칭 알고리즘 실행 API
router.post('/:id/finish', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    if (!walk) return ApiResponse.notFound(res, '산책 기록을 찾을 수 없습니다');

    if (walk.status === 'completed') {
      return ApiResponse.success(res, null, '이미 완료된 산책입니다');
    }

    walk.status = 'completed';
    await walk.save();

    await matchWalkPath(walk.id); // PostGIS 분석 및 저장

    return ApiResponse.updated(res, null, '산책이 완료되고 경로가 분석되었습니다');
  } catch (err) {
    console.error(err);
    return ApiResponse.serverError(res, '산책 종료 처리 중 오류가 발생했습니다', err);
  }
});

/**
 * @swagger
 * /api/walks/{id}/path:
 *   get:
 *     summary: 정제된 경로 조회 (GeoJSON)
 *     description: 경로 매칭 알고리즘으로 정제된 산책 경로를 GeoJSON 형태로 반환합니다
 *     tags: [Walks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 산책 기록 ID
 *     responses:
 *       200:
 *         description: 정제된 경로 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: GeoJSON LineString 객체
 *               properties:
 *                 type:
 *                   type: string
 *                   example: "LineString"
 *                 coordinates:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: number
 *                   example: [[126.9780, 37.5665], [126.9790, 37.5675]]
 *       400:
 *         description: 정제된 경로가 아직 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 산책 기록을 찾을 수 없음
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
// 경로 매칭 알고리즘으로 정제된 경로를 GeoJSON으로 반환 (프론트 시각화용)
router.get('/:id/path', async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const walk = await Walk.findByPk(req.params.id);

    if (!walk) {
      return res.status(404).json({ error: '산책 기록을 찾을 수 없습니다' });
    }

    if (!walk.walk_path) {
      return res.status(400).json({ error: '정제된 경로가 아직 존재하지 않습니다' });
    }

    const [geo] = await sequelize.query(
      `SELECT ST_AsGeoJSON(walk_path)::json AS geojson FROM walks WHERE id = :walkId`,
      {
        replacements: { walkId: req.params.id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.setHeader('Content-Type', 'application/json'); // CORB 예방
    return res.status(200).json(geo.geojson); // GeoJSON만 바로 반환
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '경로 조회 중 오류 발생', details: err });
  }
});

/**
 * @swagger
 * /api/walks/{id}/deviation-analysis:
 *   get:
 *     summary: 20m 이탈 구간 분석
 *     description: 코스 산책에서 20m 이상 이탈한 구간을 분석합니다 (자유 산책은 분석 불가)
 *     tags: [Walks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 산책 기록 ID
 *     responses:
 *       200:
 *         description: 이탈 분석 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     walkId:
 *                       type: string
 *                       format: uuid
 *                     courseId:
 *                       type: string
 *                       format: uuid
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         totalPoints:
 *                           type: integer
 *                           description: 전체 GPS 포인트 수
 *                         validPoints:
 *                           type: integer
 *                           description: 20m 이내 유효 포인트 수
 *                         deviationPoints:
 *                           type: integer
 *                           description: 20m 이탈 포인트 수
 *                         deviationPercentage:
 *                           type: number
 *                           description: 이탈 비율(%)
 *                         maxDeviation:
 *                           type: number
 *                           description: 최대 이탈 거리(m)
 *                 message:
 *                   type: string
 *                   example: "20m 이탈 구간 분석 완료"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 자유 산책은 이탈 분석 불가
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 산책 기록을 찾을 수 없음
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
// 20m 이탈 구간 분석 API (선택적 기능)
router.get('/:id/deviation-analysis', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    if (!walk) {
      return ApiResponse.notFound(res, '산책 기록을 찾을 수 없습니다');
    }

    if (!walk.course_id) {
      return ApiResponse.success(res, {
        message: '자유 산책은 이탈 분석이 불가능합니다',
        analysis: null
      }, '이탈 분석 결과');
    }

    const deviationStats = await analyze20mDeviations(walk.id);
    
    return ApiResponse.success(res, {
      walkId: walk.id,
      courseId: walk.course_id,
      analysis: deviationStats
    }, '20m 이탈 구간 분석 완료');

  } catch (error) {
    console.error('20m 이탈 분석 오류:', error);
    return ApiResponse.serverError(res, '이탈 구간 분석 중 오류가 발생했습니다', error);
  }
});

module.exports = router;
