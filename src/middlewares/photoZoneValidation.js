const ApiResponse = require('../utils/response');
const PHOTO_ZONE_CONFIG = require('../config/photoZoneConfig');

/**
 * 포토존 관련 검증 미들웨어
 * 반복되는 검증 로직을 재사용 가능한 미들웨어로 분리
 */

class PhotoZoneValidation {

  /**
   * 위치 정보 검증 미들웨어
   */
  static validateLocation(req, res, next) {
    const { latitude, longitude } = req.query.latitude ? req.query : req.body;

    // 필수 파라미터 확인
    if (!latitude || !longitude) {
      return ApiResponse.validationError(res, {
        latitude: '위도는 필수입니다',
        longitude: '경도는 필수입니다'
      }, PHOTO_ZONE_CONFIG.ERROR_MESSAGES.LOCATION_REQUIRED);
    }

    // 좌표 유효성 검증
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return ApiResponse.validationError(res, null, 
        PHOTO_ZONE_CONFIG.ERROR_MESSAGES.INVALID_COORDINATES);
    }
    
    // 좌표 범위 검증
    const { MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE } = PHOTO_ZONE_CONFIG.COORDINATES;
    
    if (lat < MIN_LATITUDE || lat > MAX_LATITUDE || lng < MIN_LONGITUDE || lng > MAX_LONGITUDE) {
      return ApiResponse.validationError(res, null, 
        PHOTO_ZONE_CONFIG.ERROR_MESSAGES.COORDINATES_OUT_OF_RANGE);
    }

    // 검증된 좌표를 req에 저장
    req.validatedLocation = { latitude: lat, longitude: lng };
    next();
  }

  /**
   * 검색 파라미터 검증 및 정규화 미들웨어
   */
  static validateSearchParams(req, res, next) {
    const { radius, limit } = req.query;
    const { SEARCH } = PHOTO_ZONE_CONFIG;

    // 반경 검증 및 정규화
    let searchRadius = SEARCH.DEFAULT_RADIUS;
    if (radius) {
      const radiusNum = parseInt(radius);
      if (!isNaN(radiusNum) && radiusNum > 0) {
        searchRadius = Math.min(radiusNum, SEARCH.MAX_RADIUS);
      }
    }

    // 제한 개수 검증 및 정규화
    let searchLimit = SEARCH.DEFAULT_LIMIT;
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        searchLimit = Math.min(limitNum, SEARCH.MAX_LIMIT);
      }
    }

    // 정규화된 값을 req에 저장
    req.searchParams = {
      radius: searchRadius,
      limit: searchLimit
    };
    
    next();
  }

  /**
   * 페이지네이션 파라미터 검증 미들웨어
   */
  static validatePagination(req, res, next) {
    const { page, limit } = req.query;
    const { PAGINATION } = PHOTO_ZONE_CONFIG;

    // 페이지 번호 검증
    let pageNum = PAGINATION.DEFAULT_PAGE;
    if (page) {
      const pageNumber = parseInt(page);
      if (!isNaN(pageNumber) && pageNumber >= PAGINATION.MIN_PAGE) {
        pageNum = pageNumber;
      }
    }

    // 페이지당 개수 검증
    let limitNum = PAGINATION.DEFAULT_LIMIT;
    if (limit) {
      const limitNumber = parseInt(limit);
      if (!isNaN(limitNumber) && limitNumber >= PAGINATION.MIN_LIMIT) {
        limitNum = Math.min(limitNumber, PAGINATION.MAX_LIMIT);
      }
    }

    // 정규화된 값을 req에 저장
    req.pagination = {
      page: pageNum,
      limit: limitNum
    };
    
    next();
  }

  /**
   * UUID 파라미터 검증 미들웨어
   */
  static validateUUIDs(requiredFields) {
    return (req, res, next) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const errors = {};

      for (const field of requiredFields) {
        const value = req.params[field] || req.body[field] || req.query[field];
        
        if (!value) {
          errors[field] = `${field}는 필수입니다`;
        } else if (!uuidRegex.test(value)) {
          errors[field] = `${field}는 올바른 UUID 형식이어야 합니다`;
        }
      }

      if (Object.keys(errors).length > 0) {
        return ApiResponse.validationError(res, errors, '필수 정보가 누락되었거나 잘못되었습니다');
      }

      next();
    };
  }

  /**
   * 파일 업로드 검증 미들웨어
   */
  static validateFileUpload(req, res, next) {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return ApiResponse.validationError(res, null, 
        PHOTO_ZONE_CONFIG.ERROR_MESSAGES.FILE_REQUIRED);
    }

    // 파일 크기 검증 (multer에서도 체크하지만 추가 검증)
    if (uploadedFile.size > PHOTO_ZONE_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      return ApiResponse.validationError(res, null, 
        `파일 크기는 ${PHOTO_ZONE_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다`);
    }

    // MIME 타입 검증
    if (!PHOTO_ZONE_CONFIG.UPLOAD.ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype)) {
      return ApiResponse.validationError(res, null, 
        PHOTO_ZONE_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    next();
  }

  /**
   * 업로드 필수 필드 검증 미들웨어
   */
  static validateUploadFields(req, res, next) {
    const { photozone_id, walk_id, user_latitude, user_longitude } = req.body;
    const userId = req.user?.id || req.body.user_id;

    const errors = {};

    if (!photozone_id) errors.photozone_id = '포토존 ID는 필수입니다';
    if (!walk_id) errors.walk_id = '산책 ID는 필수입니다';
    if (!userId) errors.user_id = '사용자 인증이 필요합니다';
    if (!user_latitude) errors.user_latitude = '현재 위도는 필수입니다';
    if (!user_longitude) errors.user_longitude = '현재 경도는 필수입니다';

    if (Object.keys(errors).length > 0) {
      return ApiResponse.validationError(res, errors, '필수 정보가 누락되었습니다');
    }

    // 위치 정보 추가 검증
    const userLat = parseFloat(user_latitude);
    const userLng = parseFloat(user_longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      return ApiResponse.validationError(res, null, '올바른 위치 정보가 아닙니다');
    }

    // 검증된 데이터를 req에 저장
    req.uploadData = {
      photozone_id,
      walk_id,
      user_id: userId,
      user_latitude: userLat,
      user_longitude: userLng
    };

    next();
  }
}

module.exports = PhotoZoneValidation;
