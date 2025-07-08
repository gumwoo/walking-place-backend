const express = require('express');
const ApiResponse = require('../utils/response');

// 각 도메인별 라우터 import
const courseRoutes = require('./courses');

const router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API 상태 확인
 *     description: API 서버의 기본 상태를 확인합니다
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API 서버 정상 동작
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "산책명소 API 서버가 정상적으로 동작 중입니다"
 *               data:
 *                 version: "1.0.0"
 *                 environment: "development"
 *                 documentation: "/api-docs"
 *               timestamp: "2025-07-03T12:00:00.000Z"
 */
router.get('/', (req, res) => {
  ApiResponse.success(res, {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs'
  }, '산책명소 API 서버가 정상적으로 동작 중입니다');
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 헬스 체크
 *     description: 서버와 데이터베이스 연결 상태를 확인합니다
 *     tags: [System]
 *     responses:
 *       200:
 *         description: 서버 상태 정상
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/health', async (req, res) => {
  try {
    // 데이터베이스 연결 상태 확인
    const { sequelize } = require('../config/database');
    await sequelize.authenticate();

    ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    }, '서버가 정상적으로 동작 중입니다');
  } catch (error) {
    ApiResponse.serverError(res, '서버 상태 확인 중 오류가 발생했습니다', error);
  }
});

// 도메인별 라우트 등록
router.use('/courses', courseRoutes);

module.exports = router;
