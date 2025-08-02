const { Course, MarkingPhotozone, Location, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * 지도 관련 서비스
 */
class MapService {

  /**
   * 지도 표시 및 주변 정보 조회
   * @param {Object} params - 검색 파라미터
   * @param {number} params.latitude - 위도
   * @param {number} params.longitude - 경도
   * @param {number} params.radius - 반경 (미터)
   * @returns {Object} 지도 주변 정보
   */
  async getMapAreas({ latitude, longitude, radius }) {
    try {
      logger.debug('지도 주변 정보 조회 서비스 시작', { latitude, longitude, radius });

      // 주변 코스 조회
      const courses = await this.getNearbyCourses({ latitude, longitude, radius });
      
      // 주변 마킹 포토존 조회
      const markingPhotozones = await this.getNearbyPhotozones({ latitude, longitude, radius });
      
      // 주변 위치 정보 조회
      const locations = await this.getNearbyLocations({ latitude, longitude, radius });

      const result = {
        center: {
          latitude,
          longitude
        },
        radius,
        courses: courses.slice(0, 10),
        markingPhotozones: markingPhotozones.slice(0, 20),
        locations: locations.slice(0, 5),
        summary: {
          totalCourses: courses.length,
          totalPhotozones: markingPhotozones.length,
          totalLocations: locations.length
        }
      };

      logger.debug('지도 주변 정보 조회 서비스 완료', { 
        latitude, longitude, radius,
        courseCount: courses.length,
        photozoneCount: markingPhotozones.length,
        locationCount: locations.length
      });

      return result;

    } catch (error) {
      logger.error('지도 주변 정보 조회 서비스 오류:', error);
      throw new Error('지도 주변 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 주변 코스 조회 (간단한 버전)
   */
  async getNearbyCourses({ latitude, longitude, radius }) {
    try {
      const courses = await Course.findAll({
        attributes: [
          'courseId',
          'courseName', 
          'difficulty',
          'courseLengthMeters',
          'averageTailcopterScore',
          'coverImageUrl'
        ],
        limit: 20,
        order: [['averageTailcopterScore', 'DESC']]
      });

      return courses.map(course => ({
        courseId: course.courseId,
        courseName: course.courseName,
        difficulty: course.difficulty,
        courseLengthMeters: course.courseLengthMeters,
        averageTailcopterScore: parseFloat(course.averageTailcopterScore) || 0,
        coverImageUrl: course.coverImageUrl,
        type: 'course'
      }));

    } catch (error) {
      logger.error('주변 코스 조회 서비스 오류:', error);
      return [];
    }
  }

  /**
   * 주변 마킹 포토존 조회
   */
  async getNearbyPhotozones({ latitude, longitude, radius }) {
    try {
      const photozones = await MarkingPhotozone.findAll({
        attributes: [
          'photozoneId',
          'latitude',
          'longitude', 
          'isRecommended'
        ],
        limit: 30,
        order: [['isRecommended', 'DESC'], ['createdAt', 'DESC']]
      });

      return photozones.map(photozone => ({
        photozoneId: photozone.photozoneId,
        latitude: parseFloat(photozone.latitude),
        longitude: parseFloat(photozone.longitude),
        isRecommended: photozone.isRecommended,
        type: 'photozone'
      }));

    } catch (error) {
      logger.error('주변 마킹 포토존 조회 서비스 오류:', error);
      return [];
    }
  }

  /**
   * 주변 위치 정보 조회
   */
  async getNearbyLocations({ latitude, longitude, radius }) {
    try {
      const locations = await Location.findAll({
        attributes: [
          'locationId',
          'addressName',
          'areaName',
          'city',
          'province',
          'latitude',
          'longitude'
        ],
        limit: 10,
        order: [['areaName', 'ASC']]
      });

      return locations.map(location => ({
        locationId: location.locationId,
        addressName: location.addressName,
        areaName: location.areaName,
        city: location.city,
        province: location.province,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        type: 'location'
      }));

    } catch (error) {
      logger.error('주변 위치 조회 서비스 오류:', error);
      return [];
    }
  }

  /**
   * 지역별 요약 정보 조회
   */
  async getAreaSummary(areaName) {
    try {
      logger.debug('지역 요약 정보 조회 서비스 시작', { areaName });

      const courseCount = await Course.count();
      const photozoneCount = await MarkingPhotozone.count();

      const result = {
        areaName,
        courseCount,
        photozoneCount,
        recommendedCourses: [],
        popularPhotozones: []
      };

      logger.debug('지역 요약 정보 조회 서비스 완료', { areaName, courseCount, photozoneCount });

      return result;

    } catch (error) {
      logger.error('지역 요약 정보 조회 서비스 오류:', error);
      throw new Error('지역 요약 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 지도 마커 정보 조회
   */
  async getMapMarkers({ latitude, longitude, radius, types }) {
    try {
      logger.debug('지도 마커 정보 조회 서비스 시작', { latitude, longitude, radius, types });

      const markers = [];

      if (types.includes('courses')) {
        const courses = await this.getNearbyCourses({ latitude, longitude, radius });
        markers.push(...courses.map(course => ({
          id: course.courseId,
          type: 'course',
          latitude: latitude,
          longitude: longitude,
          title: course.courseName,
          subtitle: `${course.difficulty}`,
          score: course.averageTailcopterScore
        })));
      }

      if (types.includes('photozones')) {
        const photozones = await this.getNearbyPhotozones({ latitude, longitude, radius });
        markers.push(...photozones.map(photozone => ({
          id: photozone.photozoneId,
          type: 'photozone',
          latitude: photozone.latitude,
          longitude: photozone.longitude,
          title: '마킹 포토존',
          isRecommended: photozone.isRecommended
        })));
      }

      logger.debug('지도 마커 정보 조회 서비스 완료', { markerCount: markers.length });

      return markers;

    } catch (error) {
      logger.error('지도 마커 정보 조회 서비스 오류:', error);
      throw new Error('지도 마커 정보 조회 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new MapService();
