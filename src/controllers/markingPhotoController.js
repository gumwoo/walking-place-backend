// C:\walking-backend\src\controllers\markingPhotoController.js

const markingPhotoService = require('../services/markingPhotoService');
const markingPhotozoneService = require('../services/markingPhotozoneService');
const logger = require('../config/logger');

/**
 * 마킹포토 관련 컨트롤러
 */
class MarkingPhotoController {
  
  /**
   * 새로운 마킹 포인트 등록 (마킹 버튼을 통한 첫 사진)
   * POST /api/v1/marking-photos
   */
  async createMarkingPoint(req, res) {
    try {
      logger.info('새로운 마킹 포인트 등록 요청 시작');
      
      // 인증 미들웨어에서 설정된 user_id를 올바르게 가져옵니다.
      const userId = req.user.user_id;
      const { walkRecordId, latitude, longitude, photoUrl } = req.body;
      
      if (!walkRecordId || !latitude || !longitude || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: '산책 기록 ID, 위도, 경도, 사진 URL이 필요합니다.',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const result = await markingPhotoService.createMarkingPoint({
        userId,
        walkRecordId,
        latitude,
        longitude,
        photoUrl
      });
      
      logger.info('새로운 마킹 포인트 등록 성공', { 
        userId, 
        markingPhotoId: result.markingPhotoId 
      });
      
      return res.status(201).json({
        success: true,
        message: '마킹 포인트가 성공적으로 등록되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('새로운 마킹 포인트 등록 실패:', error);
      
      if (error.message.includes('산책 기록을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'WALK_RECORD_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '마킹 포인트 등록 중 오류가 발생했습니다.',
        code: 'CREATE_MARKING_POINT_ERROR'
      });
    }
  }

  /**
   * 마킹 포토존 상세 정보 조회
   * GET /api/v1/marking-photozones/{photozoneId}
   */
  async getPhotozoneDetails(req, res) {
    try {
      logger.info('마킹 포토존 상세 정보 조회 요청 시작');
      
      const { photozoneId } = req.params;
      // 인증 미들웨어에서 설정된 user_id를 올바르게 가져옵니다.
      const userId = req.user.user_id; 
      
      if (!photozoneId) {
        return res.status(400).json({
          success: false,
          message: '포토존 ID가 필요합니다.',
          code: 'MISSING_PHOTOZONE_ID'
        });
      }

      const result = await markingPhotozoneService.getPhotozoneDetails(photozoneId, userId);
      
      logger.info('마킹 포토존 상세 정보 조회 성공', { photozoneId });
      
      return res.status(200).json({
        success: true,
        message: '포토존 상세 정보를 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('마킹 포토존 상세 정보 조회 실패:', error);
      
      if (error.message.includes('포토존을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'PHOTOZONE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '포토존 상세 정보 조회 중 오류가 발생했습니다.',
        code: 'GET_PHOTOZONE_DETAILS_ERROR'
      });
    }
  }

  /**
   * 기존 마킹 포토존에 사진 추가
   * POST /api/v1/marking-photozones/{photozoneId}/photos
   */
  async addPhotoToPhotozone(req, res) {
    try {
      logger.info('기존 포토존에 사진 추가 요청 시작');
      
      const { photozoneId } = req.params;
      const { photoUrl } = req.body;
      // 인증 미들웨어에서 설정된 user_id를 올바르게 가져옵니다.
      const userId = req.user.user_id;
      
      if (!photozoneId || !photoUrl) {
        return res.status(400).json({
          success: false,
          message: '포토존 ID와 사진 URL이 필요합니다.',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const result = await markingPhotozoneService.addPhotoToPhotozone(
        photozoneId, 
        photoUrl, 
        userId
      );
      
      logger.info('기존 포토존에 사진 추가 성공', { 
        photozoneId,
        photoId: result.photoId 
      });
      
      return res.status(201).json({
        success: true,
        message: '포토존에 사진이 성공적으로 추가되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('기존 포토존에 사진 추가 실패:', error);
      
      if (error.message.includes('포토존을 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'PHOTOZONE_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '포토존에 사진 추가 중 오류가 발생했습니다.',
        code: 'ADD_PHOTO_TO_PHOTOZONE_ERROR'
      });
    }
  }
}

module.exports = new MarkingPhotoController();
