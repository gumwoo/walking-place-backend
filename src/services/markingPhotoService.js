// C:\walking-backend\src\services\markingPhotoService.js

const { MarkingPhoto, MarkingPhotozone, User, WalkRecord } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * 마킹포토 관련 서비스
 */
class MarkingPhotoService {

  /**
   * 새로운 마킹 포인트 등록 (50m 통합 로직 포함)
   * @param {Object} params - 업로드 매개변수
   * @param {string} params.userId - 사용자 ID
   * @param {string} params.walkRecordId - 산책 기록 ID (Walk ID)
   * @param {number} params.latitude - 마킹 위치 위도
   * @param {number} params.longitude - 마킹 위치 경도
   * @param {string} params.photoUrl - 클라이언트에서 업로드한 사진 URL
   * @returns {Object} 마킹 사진 및 포토존 정보
   */
  async createMarkingPoint({ userId, walkRecordId, latitude, longitude, photoUrl }) {
    try {
      logger.info('새로운 마킹 포인트 등록 서비스 시작', {
        userId,
        walkRecordId,
        latitude,
        longitude
      });

      // 1. 산책 기록 존재 여부 확인
      const walkRecord = await WalkRecord.findByPk(walkRecordId);
      if (!walkRecord) {
        throw new Error('지정된 산책 기록을 찾을 수 없습니다.');
      }

      // 2. 50m 반경 내 기존 포토존 검색
      const nearbyPhotozone = await this.findNearbyPhotozone(latitude, longitude, 50);

      let photozoneId;
      let isNewPhotozone = false;

      if (nearbyPhotozone) {
        // 기존 포토존에 연결
        photozoneId = nearbyPhotozone.photozone_id; // 컬럼명 'photozone_id'로 수정
        logger.info('기존 포토존에 연결', { photozoneId });
      } else {
        // 새로운 포토존 생성
        const newPhotozone = await MarkingPhotozone.create({
          course_id: walkRecord.course_id, // 산책 기록의 코스와 연결
          is_recommended: false, // 기본값 설정
          latitude: latitude,
          longitude: longitude
        });
        photozoneId = newPhotozone.photozone_id; // 컬럼명 'photozone_id'로 수정
        isNewPhotozone = true;
        logger.info('새로운 포토존 생성', { photozoneId });
      }

      // 3. 마킹 사진 생성
      const markingPhoto = await MarkingPhoto.create({
        photozone_id: photozoneId, // 컬럼명 'photozone_id'로 수정
        user_id: userId,
        walk_record_id: walkRecordId, // 컬럼명 'walk_record_id'로 수정
        image_url: photoUrl, // 컬럼명 'image_url'로 수정
        taken_at: new Date()
      });

      logger.info('새로운 마킹 포인트 등록 서비스 완료', {
        markingPhotoId: markingPhoto.photo_id, // 컬럼명 'photo_id'로 수정
        photozoneId,
        isNewPhotozone
      });

      return {
        markingPhotoId: markingPhoto.photo_id, // 컬럼명 'photo_id'로 수정
        photozoneId,
        latitude,
        longitude,
        uploadedAt: markingPhoto.created_at
      };

    } catch (error) {
      logger.error('새로운 마킹 포인트 등록 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 50m 반경 내 기존 포토존 검색 (위도/경도 기반)
   * @param {number} latitude - 기준 위도
   * @param {number} longitude - 기준 경도  
   * @param {number} radiusMeters - 반경 (미터)
   * @returns {Object|null} 발견된 포토존 또는 null
   */
  async findNearbyPhotozone(latitude, longitude, radiusMeters) {
    try {
      // PostGIS ST_Distance 함수 사용하여 거리 기반 검색
      // 또는 Haversine 공식을 JavaScript로 구현
      const photozones = await MarkingPhotozone.findAll({
        attributes: ['photozone_id', 'latitude', 'longitude'] // 필드명 수정
      });

      for (const zone of photozones) {
        // PostGIS Point에서 좌표 추출
        const distance = this.calculateDistance(latitude, longitude, parseFloat(zone.latitude), parseFloat(zone.longitude));
        
        if (distance <= radiusMeters) {
          return zone;
        }
      }

      return null;

    } catch (error) {
      logger.error('주변 포토존 검색 오류:', error);
      return null;
    }
  }

  /**
   * Haversine 공식을 이용한 두 지점 간 거리 계산 (미터)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위 거리
  }
}

module.exports = new MarkingPhotoService();
