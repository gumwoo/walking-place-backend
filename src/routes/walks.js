const express = require('express');
const router = express.Router();
const { matchWalkPath } = require('../services/walkService');
const { analyze100mDeviations } = require('../services/walkPathRefinementService');
const { Walk } = require('../models');
const ApiResponse = require('../utils/response');


// 산책 종료 + 경로 매칭 알고리즘 실행 API
router.post('/:id/end', async (req, res) => {
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

// 100m 이탈 구간 분석 API (선택적 기능)
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

    const deviationStats = await analyze100mDeviations(walk.id);
    
    return ApiResponse.success(res, {
      walkId: walk.id,
      courseId: walk.course_id,
      analysis: deviationStats
    }, '100m 이탈 구간 분석 완료');

  } catch (error) {
    console.error('100m 이탈 분석 오류:', error);
    return ApiResponse.serverError(res, '이탈 구간 분석 중 오류가 발생했습니다', error);
  }
});




module.exports = router;
