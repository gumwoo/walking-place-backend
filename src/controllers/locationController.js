const locationService = require('../services/locationService');
const logger = require('../config/logger');

/**
 * 위치 관련 컨트롤러
 * API 스펙 기준으로 구현
 */
class LocationController {

  /**
   * 위치 검색
   * GET /api/v1/locations/search?keyword={keyword}
   */
  async searchLocations(req, res) {
    try {
      logger.info('위치 검색 요청 시작');
      
      const { keyword } = req.query;
      
      if (!keyword || keyword.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '검색 키워드가 필요합니다.',
          code: 'MISSING_KEYWORD'
        });
      }

      if (keyword.length < 2) {
        return res.status(400).json({
          success: false,
          message: '검색 키워드는 최소 2자 이상 입력해주세요.',
          code: 'KEYWORD_TOO_SHORT'
        });
      }

      const locations = await locationService.searchLocations(keyword);
      
      logger.info('위치 검색 성공', { 
        keyword,
        count: locations.length 
      });
      
      return res.status(200).json({
        success: true,
        message: '위치 검색을 성공적으로 완료했습니다.',
        data: locations
      });

    } catch (error) {
      logger.error('위치 검색 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '위치 검색 중 오류가 발생했습니다.',
        code: 'LOCATION_SEARCH_ERROR'
      });
    }
  }

  /**
   * 특정 위치 상세 정보 조회
   * GET /api/v1/locations/{locationId}
   */
  async getLocationDetails(req, res) {
    try {
      logger.info('위치 상세 정보 조회 요청 시작');
      
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          success: false,
          message: '위치 ID가 필요합니다.',
          code: 'MISSING_LOCATION_ID'
        });
      }

      const location = await locationService.getLocationById(locationId);
      
      logger.info('위치 상세 정보 조회 성공', { locationId });
      
      return res.status(200).json({
        success: true,
        message: '위치 상세 정보를 성공적으로 조회했습니다.',
        data: location
      });

    } catch (error) {
      logger.error('위치 상세 정보 조회 실패:', error);
      
      if (error.message.includes('위치를 찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'LOCATION_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: '위치 상세 정보 조회 중 오류가 발생했습니다.',
        code: 'LOCATION_DETAILS_ERROR'
      });
    }
  }

  /**
   * 지역별 위치 목록 조회
   * GET /api/v1/locations/area/{areaName}
   */
  async getLocationsByArea(req, res) {
    try {
      logger.info('지역별 위치 목록 조회 요청 시작');
      
      const { areaName } = req.params;
      const { page = 1, size = 10 } = req.query;
      
      if (!areaName) {
        return res.status(400).json({
          success: false,
          message: '지역명이 필요합니다.',
          code: 'MISSING_AREA_NAME'
        });
      }

      const result = await locationService.getLocationsByArea({
        areaName,
        page: parseInt(page),
        size: parseInt(size)
      });
      
      logger.info('지역별 위치 목록 조회 성공', { 
        areaName,
        count: result.locations.length,
        totalCount: result.totalCount
      });
      
      return res.status(200).json({
        success: true,
        message: '지역별 위치 목록을 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('지역별 위치 목록 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '지역별 위치 목록 조회 중 오류가 발생했습니다.',
        code: 'AREA_LOCATIONS_ERROR'
      });
    }
  }

  /**
   * 주변 위치 검색 (위도/경도 기반)
   * GET /api/v1/locations/nearby?latitude={lat}&longitude={lon}&radius={radius}
   */
  async getNearbyLocations(req, res) {
    try {
      logger.info('주변 위치 검색 요청 시작');
      
      const { latitude, longitude, radius = 1000 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: '위도와 경도가 필요합니다.',
          code: 'MISSING_COORDINATES'
        });
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const rad = parseInt(radius);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          success: false,
          message: '올바른 위도와 경도를 입력해주세요.',
          code: 'INVALID_COORDINATES'
        });
      }

      const locations = await locationService.getNearbyLocations({
        latitude: lat,
        longitude: lon,
        radius: rad
      });
      
      logger.info('주변 위치 검색 성공', { 
        latitude: lat,
        longitude: lon,
        radius: rad,
        count: locations.length
      });
      
      return res.status(200).json({
        success: true,
        message: '주변 위치 검색을 성공적으로 완료했습니다.',
        data: locations
      });

    } catch (error) {
      logger.error('주변 위치 검색 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '주변 위치 검색 중 오류가 발생했습니다.',
        code: 'NEARBY_LOCATIONS_ERROR'
      });
    }
  }
}

module.exports = new LocationController();
