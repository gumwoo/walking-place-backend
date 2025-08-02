const mapService = require('../services/mapService');
const logger = require('../config/logger');

/**
 * 지도 관련 컨트롤러
 * API 스펙 기준으로 구현
 */
class MapController {

  /**
   * 지도 표시 및 주변 정보 조회
   * GET /api/v1/map/areas?latitude={lat}&longitude={lon}&radius={r}
   */
  async getMapAreas(req, res) {
    try {
      logger.info('지도 주변 정보 조회 요청 시작');
      
      const { latitude, longitude, radius = 2000 } = req.query;
      
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

      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: '위도는 -90부터 90 사이의 값이어야 합니다.',
          code: 'INVALID_LATITUDE'
        });
      }

      if (lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: '경도는 -180부터 180 사이의 값이어야 합니다.',
          code: 'INVALID_LONGITUDE'
        });
      }

      const mapData = await mapService.getMapAreas({
        latitude: lat,
        longitude: lon,
        radius: rad
      });
      
      logger.info('지도 주변 정보 조회 성공', { 
        latitude: lat,
        longitude: lon,
        radius: rad,
        courseCount: mapData.courses?.length || 0,
        photozoneCount: mapData.markingPhotozones?.length || 0
      });
      
      return res.status(200).json({
        success: true,
        message: '지도 주변 정보를 성공적으로 조회했습니다.',
        data: mapData
      });

    } catch (error) {
      logger.error('지도 주변 정보 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '지도 주변 정보 조회 중 오류가 발생했습니다.',
        code: 'MAP_AREAS_ERROR'
      });
    }
  }

  /**
   * 특정 지역의 코스 및 포토존 요약 정보 조회
   * GET /api/v1/map/summary?areaName={areaName}
   */
  async getAreaSummary(req, res) {
    try {
      logger.info('지역 요약 정보 조회 요청 시작');
      
      const { areaName } = req.query;
      
      if (!areaName || areaName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '지역명이 필요합니다.',
          code: 'MISSING_AREA_NAME'
        });
      }

      const summary = await mapService.getAreaSummary(areaName);
      
      logger.info('지역 요약 정보 조회 성공', { 
        areaName,
        courseCount: summary.courseCount,
        photozoneCount: summary.photozoneCount
      });
      
      return res.status(200).json({
        success: true,
        message: '지역 요약 정보를 성공적으로 조회했습니다.',
        data: summary
      });

    } catch (error) {
      logger.error('지역 요약 정보 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '지역 요약 정보 조회 중 오류가 발생했습니다.',
        code: 'AREA_SUMMARY_ERROR'
      });
    }
  }

  /**
   * 지도에 표시할 마커 정보 조회
   * GET /api/v1/map/markers?latitude={lat}&longitude={lon}&radius={r}&types={types}
   */
  async getMapMarkers(req, res) {
    try {
      logger.info('지도 마커 정보 조회 요청 시작');
      
      const { 
        latitude, 
        longitude, 
        radius = 2000, 
        types = 'courses,photozones' 
      } = req.query;
      
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
      const markerTypes = types.split(',').map(type => type.trim());

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          success: false,
          message: '올바른 위도와 경도를 입력해주세요.',
          code: 'INVALID_COORDINATES'
        });
      }

      const markers = await mapService.getMapMarkers({
        latitude: lat,
        longitude: lon,
        radius: rad,
        types: markerTypes
      });
      
      logger.info('지도 마커 정보 조회 성공', { 
        latitude: lat,
        longitude: lon,
        radius: rad,
        types: markerTypes,
        markerCount: markers.length
      });
      
      return res.status(200).json({
        success: true,
        message: '지도 마커 정보를 성공적으로 조회했습니다.',
        data: markers
      });

    } catch (error) {
      logger.error('지도 마커 정보 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '지도 마커 정보 조회 중 오류가 발생했습니다.',
        code: 'MAP_MARKERS_ERROR'
      });
    }
  }
}

module.exports = new MapController();
