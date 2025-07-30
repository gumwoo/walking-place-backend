/**
 * 포토존 관련 설정값들
 * 하드코딩 방지를 위한 설정 파일
 */

const PHOTO_ZONE_CONFIG = {
  // 검색 관련 설정
  SEARCH: {
    DEFAULT_RADIUS: 1000,     // 기본 검색 반경 (미터)
    MAX_RADIUS: 5000,         // 최대 검색 반경 (미터)
    DEFAULT_LIMIT: 20,        // 기본 조회 개수
    MAX_LIMIT: 50,            // 최대 조회 개수
    PREVIEW_PHOTOS: 3         // 미리보기 사진 개수
  },

  // 파일 업로드 설정
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ],
    UPLOAD_PATH: '/uploads/photozone'
  },

  // 이미지 최적화 설정
  IMAGE_OPTIMIZATION: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    QUALITY: 80,
    FORMAT: 'jpeg'
  },

  // 페이지네이션 설정
  PAGINATION: {
    DEFAULT_PAGE: 1,
    MIN_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MIN_LIMIT: 1,
    MAX_LIMIT: 50
  },

  // 좌표 검증 설정
  COORDINATES: {
    MIN_LATITUDE: -90,
    MAX_LATITUDE: 90,
    MIN_LONGITUDE: -180,
    MAX_LONGITUDE: 180
  },

  // 에러 메시지
  ERROR_MESSAGES: {
    PHOTOZONE_NOT_FOUND: '포토존을 찾을 수 없습니다',
    PHOTOZONE_INACTIVE: '비활성 상태의 포토존입니다',
    OUT_OF_RANGE: '포토존 감지 범위 내에 있지 않습니다',
    INVALID_COORDINATES: '올바른 좌표 형식이 아닙니다',
    COORDINATES_OUT_OF_RANGE: '좌표 범위가 올바르지 않습니다',
    LOCATION_REQUIRED: '위치 정보가 필요합니다',
    FILE_REQUIRED: '업로드할 사진 파일이 필요합니다',
    INVALID_FILE_TYPE: '이미지 파일만 업로드 가능합니다 (JPEG, PNG, WebP)'
  },

  // 성공 메시지 템플릿
  SUCCESS_MESSAGES: {
    NEARBY_FOUND: (count, radius) => `반경 ${radius}m 내 포토존 ${count}개를 조회했습니다`,
    PHOTO_UPLOADED: '포토존 사진이 성공적으로 업로드되었습니다',
    PHOTOS_RETRIEVED: '포토존 사진 목록을 조회했습니다'
  }
};

module.exports = PHOTO_ZONE_CONFIG;
