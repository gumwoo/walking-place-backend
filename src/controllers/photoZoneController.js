const photoZoneService = require('../services/photoZoneService');
const ApiResponse = require('../utils/response');
const PhotoZoneFormatter = require('../utils/photoZoneFormatter');
const PHOTO_ZONE_CONFIG = require('../config/photoZoneConfig');
const logger = require('../config/logger');

/**
 * 마킹포토존 관련 컨트롤러
 * API 명세서 기준 3개 엔드포인트 구현
 * 검증 미들웨어와 포맷터를 활용한 깔끔한 구조
 */
class PhotoZoneController {

  /**
   * 근처 포토존 조회
   * GET /api/photo-zone/nearby
   * 미들웨어에서 검증 완료된 데이터 사용
   */
  async getNearbyPhotoZones(req, res) {
    try {
      const { latitude, longitude } = req.validatedLocation;
      const { radius, limit } = req.searchParams;

      logger.info(`근처 포토존 조회 요청: lat=${latitude}, lng=${longitude}, radius=${radius}m`);

      // 서비스 호출
      const nearbyZones = await photoZoneService.getNearbyPhotoZones(
        latitude, longitude, radius, limit
      );

      // 프론트엔드 친화적인 형태로 포맷
      const formattedData = PhotoZoneFormatter.formatNearbyPhotoZones(
        nearbyZones, 
        { latitude, longitude, searchRadius: radius }
      );

      return ApiResponse.success(res, formattedData, 
        PHOTO_ZONE_CONFIG.SUCCESS_MESSAGES.NEARBY_FOUND(nearbyZones.length, radius)
      );

    } catch (error) {
      logger.error('근처 포토존 조회 컨트롤러 오류:', error);
      return ApiResponse.serverError(res, '근처 포토존 조회 중 오류가 발생했습니다', error);
    }
  }

  /**
   * 포토존 사진 업로드
   * POST /api/photo-zone/upload
   * 검증 미들웨어에서 파일 및 필드 검증 완료
   */
  async uploadPhotozonePhoto(req, res) {
    try {
      const {
        photozone_id,
        user_id,
        walk_id,
        user_latitude,
        user_longitude
      } = req.uploadData;

      const uploadedFile = req.file;

      logger.info(`포토존 사진 업로드 요청: photozoneId=${photozone_id}, userId=${user_id}`);

      // 파일 URL 생성
      const fileUrl = `${PHOTO_ZONE_CONFIG.UPLOAD.UPLOAD_PATH}/${uploadedFile.filename}`;

      // 서비스 호출
      const uploadedPhoto = await photoZoneService.uploadPhotozonePhoto(
        photozone_id,
        user_id,
        walk_id,
        fileUrl,
        user_latitude,
        user_longitude
      );

      // 프론트엔드 친화적인 형태로 포맷
      const formattedData = PhotoZoneFormatter.formatUploadedPhoto(uploadedPhoto);

      return ApiResponse.created(res, formattedData, 
        PHOTO_ZONE_CONFIG.SUCCESS_MESSAGES.PHOTO_UPLOADED
      );

    } catch (error) {
      logger.error('포토존 사진 업로드 컨트롤러 오류:', error);
      
      // 에러 타입에 따른 적절한 응답
      if (error.message.includes('찾을 수 없습니다') || 
          error.message.includes('비활성 상태') ||
          error.message.includes('범위 내에 있지 않습니다')) {
        return ApiResponse.badRequest(res, error.message);
      }
      
      return ApiResponse.serverError(res, '포토존 사진 업로드 중 오류가 발생했습니다', error);
    }
  }

  /**
   * 업로드된 사진들 조회
   * GET /api/photo-zone/photos
   * 검증 미들웨어에서 UUID 및 페이지네이션 검증 완료
   */
  async getPhotozonePhotos(req, res) {
    try {
      const { photozone_id } = req.query;
      const { page, limit } = req.pagination;

      logger.info(`포토존 사진 목록 조회: photozoneId=${photozone_id}, page=${page}`);

      // 서비스 호출
      const result = await photoZoneService.getPhotozonePhotos(
        photozone_id, page, limit
      );

      // 프론트엔드 친화적인 형태로 포맷
      const formattedData = PhotoZoneFormatter.formatPhotoZonePhotos(result);

      return ApiResponse.success(res, formattedData, 
        PHOTO_ZONE_CONFIG.SUCCESS_MESSAGES.PHOTOS_RETRIEVED
      );

    } catch (error) {
      logger.error('포토존 사진 목록 조회 컨트롤러 오류:', error);
      
      // 에러 타입에 따른 적절한 응답
      if (error.message.includes('찾을 수 없습니다') || 
          error.message.includes('비활성 상태')) {
        return ApiResponse.notFound(res, error.message);
      }
      
      return ApiResponse.serverError(res, '포토존 사진 목록 조회 중 오류가 발생했습니다', error);
    }
  }
}

module.exports = new PhotoZoneController();
