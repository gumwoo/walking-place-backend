const express = require('express');
const router = express.Router();
const walkRecordController = require('../controllers/walkRecordController');
const { authenticateToken } = require('../middlewares/auth');

// POST /api/v1/walk-records - 산책 기록 시작
router.post('/', authenticateToken, walkRecordController.startWalkRecord);

// PATCH /api/v1/walk-records/{walk_record_id}/track - 산책 경로 및 데이터 주기적 업데이트
router.patch('/:walkRecordId/track', authenticateToken, walkRecordController.updateTrack);

// PATCH /api/v1/walk-records/{walk_record_id}/status - 산책 상태 일시정지/재개
router.patch('/:walkRecordId/status', authenticateToken, walkRecordController.updateStatus);

// PUT /api/v1/walk-records/{walk_record_id}/end - 산책 기록 최종 종료 및 전체 데이터 저장
router.put('/:walkRecordId/end', authenticateToken, walkRecordController.endWalkRecord);

// PUT /api/v1/walk-records/{walk_record_id}/score - 꼬리콥터 점수 저장
router.put('/:walkRecordId/score', authenticateToken, walkRecordController.updateScore);

// GET /api/v1/walk-records/{walk_record_id}/details - 산책 경로 및 마킹 이미지 등 상세 정보 조회
router.get('/:walkRecordId/details', authenticateToken, walkRecordController.getDetails);

// POST /api/v1/walk-records/{walk_record_id}/save - 산책 기록 최종 저장 확정
router.post('/:walkRecordId/save', authenticateToken, walkRecordController.saveRecord);

module.exports = router;
