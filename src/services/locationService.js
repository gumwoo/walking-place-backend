const { Location } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * 위치 관련 서비스
 */
class LocationService {

  /**
   * 키워드로 위치 검색
   * @param {string} keyword - 검색 키워드 (동네명)
   * @returns {Array} 검색된 위치 목록
   */
  async searchLocations(keyword) {
    try {
      logger.debug('위치 검색 서비스 시작', { keyword });

      const locations = await Location.findAll({
        where: {
          [Op.or]: [
            { areaName: { [Op.iLike]: `%${keyword}%` } },
            { addressName: { [Op.iLike]: `%${keyword}%` } },
            { city: { [Op.iLike]: `%${keyword}%` } },
            { province: { [Op.iLike]: `%${keyword}%` } }
          ]
        },
        attributes: [
          'locationId',
          'addressName',
          'areaName',
          'city',
          'province',
          'latitude',
          'longitude'
        ],
        limit: 20,
        order: [['areaName', 'ASC']]
      });

      logger.debug('위치 검색 서비스 완료', { 
        keyword,
        resultCount: locations.length 
      });

      return locations.map(location => ({
        locationId: location.locationId,
        addressName: location.addressName,
        areaName: location.areaName,
        city: location.city,
        province: location.province,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      }));

    } catch (error) {
      logger.error('위치 검색 서비스 오류:', error);
      throw new Error('위치 검색 중 오류가 발생했습니다.');
    }
  }

  /**
   * 위치 ID로 상세 정보 조회
   * @param {string} locationId - 위치 ID
   * @returns {Object} 위치 상세 정보
   */
  async getLocationById(locationId) {
    try {
      logger.debug('위치 상세 정보 조회 서비스 시작', { locationId });

      const location = await Location.findByPk(locationId);

      if (!location) {
        throw new Error('위치를 찾을 수 없습니다.');
      }

      logger.debug('위치 상세 정보 조회 서비스 완료', { locationId });

      return {
        locationId: location.locationId,
        addressName: location.addressName,
        areaName: location.areaName,
        city: location.city,
        province: location.province,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      };

    } catch (error) {
      logger.error('위치 상세 정보 조회 서비스 오류:', error);
      if (error.message.includes('위치를 찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('위치 상세 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 지역별 위치 목록 조회
   * @param {Object} params - 검색 파라미터
   * @param {string} params.areaName - 지역명
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지 크기
   * @returns {Object} 위치 목록 및 페이징 정보
   */
  async getLocationsByArea({ areaName, page, size }) {
    try {
      logger.debug('지역별 위치 목록 조회 서비스 시작', { areaName, page, size });

      const offset = (page - 1) * size;

      const { count, rows } = await Location.findAndCountAll({
        where: {
          areaName: { [Op.iLike]: `%${areaName}%` }
        },
        attributes: [
          'locationId',
          'addressName',
          'areaName',
          'city',
          'province',
          'latitude',
          'longitude'
        ],
        limit: size,
        offset: offset,
        order: [['addressName', 'ASC']]
      });

      logger.debug('지역별 위치 목록 조회 서비스 완료', { 
        areaName,
        resultCount: rows.length,
        totalCount: count
      });

      return {
        locations: rows.map(location => ({
          locationId: location.locationId,
          addressName: location.addressName,
          areaName: location.areaName,
          city: location.city,
          province: location.province,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude)
        })),
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / size),
        hasNext: page < Math.ceil(count / size),
        hasPrev: page > 1
      };

    } catch (error) {
      logger.error('지역별 위치 목록 조회 서비스 오류:', error);
      throw new Error('지역별 위치 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 주변 위치 검색 (위도/경도 기반)
   * @param {Object} params - 검색 파라미터
   * @param {number} params.latitude - 위도
   * @param {number} params.longitude - 경도
   * @param {number} params.radius - 반경 (미터)
   * @returns {Array} 주변 위치 목록
   */
  async getNearbyLocations({ latitude, longitude, radius }) {
    try {
      logger.debug('주변 위치 검색 서비스 시작', { latitude, longitude, radius });

      // PostGIS를 사용한 거리 기반 검색
      // ST_DWithin 함수 사용 (지리적 거리 계산)
      const locations = await Location.findAll({
        attributes: [
          'locationId',
          'addressName',
          'areaName',
          'city',
          'province',
          'latitude',
          'longitude',
          // 거리 계산 추가
          [
            Location.sequelize.literal(
              `ST_Distance(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(${longitude}, ${latitude})::geography
              )`
            ),
            'distance'
          ]
        ],
        where: Location.sequelize.literal(
          `ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(${longitude}, ${latitude})::geography,
            ${radius}
          )`
        ),
        order: [
          [Location.sequelize.literal('distance'), 'ASC']
        ],
        limit: 50
      });

      logger.debug('주변 위치 검색 서비스 완료', { 
        latitude,
        longitude,
        radius,
        resultCount: locations.length
      });

      return locations.map(location => ({
        locationId: location.locationId,
        addressName: location.addressName,
        areaName: location.areaName,
        city: location.city,
        province: location.province,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        distance: Math.round(parseFloat(location.getDataValue('distance')))
      }));

    } catch (error) {
      logger.error('주변 위치 검색 서비스 오류:', error);
      throw new Error('주변 위치 검색 중 오류가 발생했습니다.');
    }
  }

  /**
   * 위치 정보 생성 또는 업데이트
   * @param {Object} locationData - 위치 데이터
   * @returns {Object} 생성/업데이트된 위치 정보
   */
  async createOrUpdateLocation(locationData) {
    try {
      logger.debug('위치 정보 생성/업데이트 서비스 시작', { locationData });

      const { addressName, latitude, longitude, areaName, city, province } = locationData;

      // 같은 주소가 있는지 확인
      let location = await Location.findOne({
        where: {
          addressName: addressName,
          latitude: latitude,
          longitude: longitude
        }
      });

      if (location) {
        // 기존 위치 정보 업데이트
        await location.update({
          areaName,
          city,
          province
        });
      } else {
        // 새로운 위치 정보 생성
        location = await Location.create({
          addressName,
          latitude,
          longitude,
          areaName,
          city,
          province
        });
      }

      logger.debug('위치 정보 생성/업데이트 서비스 완료', { 
        locationId: location.locationId 
      });

      return {
        locationId: location.locationId,
        addressName: location.addressName,
        areaName: location.areaName,
        city: location.city,
        province: location.province,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      };

    } catch (error) {
      logger.error('위치 정보 생성/업데이트 서비스 오류:', error);
      throw new Error('위치 정보 생성/업데이트 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new LocationService();
