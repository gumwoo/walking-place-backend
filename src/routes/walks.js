const express = require('express');
const router = express.Router();
const { matchWalkPath } = require('../services/walkService');
const { analyze100mDeviations } = require('../services/walkPathRefinementService');
const { Walk } = require('../models');
const ApiResponse = require('../utils/response');

// 자유 산책 시작 API (새로운 코스)
router.post('/free/start', async (req, res) => {
  try {
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111'; // ← 임시로 user_id = 1로 고정, 로그인API 만들면 지울 것
    const startTime = new Date();
    const walkDate = new Date().toISOString().slice(0, 10); // 날짜만

    const newWalk = await Walk.create({
      user_id: userId,
      course_id: null, // 자유 산책이므로 코스id는 null
      status: 'started',
      start_time: startTime,
      walk_date: walkDate,
      raw_coordinates: [], // 빈 배열로 초기화
    });

    return res.status(201).json({
      success: true,
      message: '자유 산책이 시작되었습니다',
      data: {
        walkId: newWalk.id,
        startedAt: startTime,
      }
    });
  } catch (error) {
    console.error('자유 산책 시작 오류:', error);
    return res.status(500).json({
      success: false,
      message: '자유 산책 시작 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

// 실시간 위치 업데이트 API (좌표 누적 추가)
router.post('/:id/location', async (req, res) => {
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

// 산책 중 좌표 조회 API (프론트 실시간 폴리라인용)
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

// 산책 진행 상태 조회 API
router.get('/:id/status', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    console.log('req.params.id:', req.params.id); // 이걸 찍어봐야 함

    if (!walk) {
      return res.status(404).json({
        success: false,
        message: '산책 기록을 찾을 수 없습니다',
      });
    }

    return res.status(200).json({
      success: true,
      message: '산책 상태 조회 성공',
      data: {
        walkId: walk.id,
        status: walk.status,
      },
    });
  } catch (error) {
    console.error('산책 상태 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '산책 상태 조회 중 오류가 발생했습니다',
      error: error.message,
    });
  }
});

// 산책 상태 변경 API (일시정지, 재시작 등)
router.put('/:id/status', async (req, res) => {
  try {
    const walk = await Walk.findByPk(req.params.id);
    if (!walk) {
      return res.status(404).json({
        success: false,
        message: '산책 기록을 찾을 수 없습니다',
      });
    }

    const validStatuses = ['started', 'completed', 'cancelled', 'paused', 'resumed'];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `유효하지 않은 상태입니다: ${status}`,
      });
    }

    walk.status = status;
    await walk.save();

    return res.status(200).json({
      success: true,
      message: `산책 상태가 ${status}로 변경되었습니다.`,
      data: {
        walkId: walk.id,
        newStatus: status
      }
    });
  } catch (err) {
    console.error('산책 상태 변경 오류:', err);
    return res.status(500).json({
      success: false,
      message: '산책 상태 변경 중 오류가 발생했습니다',
      error: err.message
    });
  }
});




module.exports = router;
