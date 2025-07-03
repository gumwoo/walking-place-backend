const { MarkingPhotozone, PhotozonePhoto, User, Course } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * 포토존 관련 비즈니스 로직 서비스
 * PostGIS 공간 쿼리를 활용한 위치 기반 서비스
 */
class PhotoZoneService {
  
  /**
   * 사용자 위치 기준 근처 포토존 조회
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도  
   * @param {number} radius - 검색 반경 (미터, 기본값: 1000m)
   * @param {number} limit - 조회 개수 제한 (기본값: 20)
   * @returns {Array} 근처 포토존 목록 (거리순 정렬)
   */
  async getNearbyPhotoZones(latitude, longitude, radius = 1000, limit = 20) {
    try {
      logger.info(`근처 포토존 조회 시작: lat=${latitude}, lng=${longitude}, radius=${radius}m`);
      
      // PostGIS ST_DWithin을 사용한 공간 쿼리
      // ST_SetSRID로 좌표계 설정 (4326 = WGS84)
      const nearbyZones = await MarkingPhotozone.findAll({
        attributes: [
          'id',
          'name', 
          'location',
          'detection_radius',
          'created_at',
          // PostGIS ST_Distance로 거리 계산 (미터 단위)
          [
            sequelize.fn(
              'ST_Distance',
              sequelize.col('location'),
              sequelize.fn(
                'ST_SetSRID', 
                sequelize.fn('ST_MakePoint', longitude, latitude),
                4326
              ),
              true // 구면 거리 계산 (미터)
            ),
            'distance'
          ]
        ],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'thumbnail_image', 'average_tail_score'],
            required: true // INNER JOIN - 활성 코스가 있는 포토존만
          },
          {
            model: PhotozonePhoto,
            as: 'photos',
            attributes: ['id', 'file_url', 'created_at'],
            include: [
              {
                model: User,
                as: 'user', 
                attributes: ['id', 'dog_name', 'dog_breed']
              }
            ],
            limit: 3, // 미리보기용 최근 사진 3개만
            order: [['created_at', 'DESC']]
          }
        ],
        where: [
          // PostGIS ST_DWithin으로 반경 내 포토존 필터링
          sequelize.where(
            sequelize.fn(
              'ST_DWithin',
              sequelize.col('location'),
              sequelize.fn(
                'ST_SetSRID',
                sequelize.fn('ST_MakePoint', longitude, latitude), 
                4326
              ),
              radius,
              true // 구면 거리 사용
            ),
            true
          )
        ],
        order: [
          // 거리순 정렬 (가까운 순)
          sequelize.literal('distance ASC')
        ],
        limit: parseInt(limit),
        subQuery: false // 복잡한 쿼리에서 서브쿼리 비활성화
      });

      logger.info(`근처 포토존 ${nearbyZones.length}개 조회 완료`);
      
      // 거리 정보를 소수점 1자리로 반올림
      const formattedZones = nearbyZones.map(zone => {
        const zoneData = zone.toJSON();
        zoneData.distance = Math.round(zoneData.distance * 10) / 10;
        return zoneData;
      });

      return formattedZones;
      
    } catch (error) {
      logger.error('근처 포토존 조회 중 오류:', error);
      throw new Error('근처 포토존 조회 중 오류가 발생했습니다');
    }
  }

  /**
   * 특정 포토존의 업로드된 사진들 조회
   * @param {string} photozoneId - 포토존 ID
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} limit - 페이지당 개수 (기본값: 20)
   * @returns {Object} 사진 목록과 페이지네이션 정보
   */
  async getPhotozonePhotos(photozoneId, page = 1, limit = 20) {
    try {
      logger.info(`포토존 사진 조회: photozoneId=${photozoneId}, page=${page}`);
      
      const offset = (page - 1) * limit;
      
      // 포토존 존재 여부 확인
      const photozone = await MarkingPhotozone.findByPk(photozoneId, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'is_active']
          }
        ]
      });
      
      if (!photozone) {
        throw new Error('포토존을 찾을 수 없습니다');
      }
      
      if (!photozone.course || !photozone.course.is_active) {
        throw new Error('비활성 상태의 포토존입니다');
      }

      // 사진 목록 조회 (페이지네이션)
      const { count, rows: photos } = await PhotozonePhoto.findAndCountAll({
        where: {
          marking_photozone_id: photozoneId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'dog_name', 'dog_breed', 'dog_size']
          }
        ],
        attributes: [
          'id',
          'file_url', 
          'created_at'
        ],
        order: [['created_at', 'DESC']], // 최신순
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      };

      logger.info(`포토존 사진 ${count}개 중 ${photos.length}개 조회 완료`);

      return {
        photozone: {
          id: photozone.id,
          name: photozone.name,
          course: photozone.course
        },
        photos,
        pagination
      };
      
    } catch (error) {
      logger.error('포토존 사진 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 포토존에 사진 업로드
   * @param {string} photozoneId - 포토존 ID
   * @param {string} userId - 사용자 ID  
   * @param {string} walkId - 산책 ID
   * @param {string} fileUrl - 업로드된 파일 URL
   * @param {number} userLat - 사용자 현재 위도
   * @param {number} userLng - 사용자 현재 경도
   * @returns {Object} 업로드된 사진 정보
   */
  async uploadPhotozonePhoto(photozoneId, userId, walkId, fileUrl, userLat, userLng) {
    try {
      logger.info(`포토존 사진 업로드: photozoneId=${photozoneId}, userId=${userId}`);
      
      // 포토존 정보 조회
      const photozone = await MarkingPhotozone.findByPk(photozoneId, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'is_active']
          }
        ]
      });
      
      if (!photozone) {
        throw new Error('포토존을 찾을 수 없습니다');
      }
      
      if (!photozone.course || !photozone.course.is_active) {
        throw new Error('비활성 상태의 포토존입니다');
      }

      // 사용자가 포토존 감지 범위 내에 있는지 확인
      const isInRange = await this.checkUserInPhotozoneRange(
        photozoneId, userLat, userLng
      );
      
      if (!isInRange) {
        throw new Error('포토존 감지 범위 내에 있지 않습니다');
      }

      // 사진 업로드 기록 저장
      const uploadedPhoto = await PhotozonePhoto.create({
        marking_photozone_id: photozoneId,
        user_id: userId,
        walk_id: walkId,
        file_url: fileUrl
      });

      // 업로드된 사진 정보 반환 (사용자 정보 포함)
      const photoWithUser = await PhotozonePhoto.findByPk(uploadedPhoto.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'dog_name', 'dog_breed', 'dog_size']
          },
          {
            model: MarkingPhotozone,
            as: 'photozone',
            attributes: ['id', 'name']
          }
        ]
      });

      logger.info(`포토존 사진 업로드 완료: photoId=${uploadedPhoto.id}`);
      
      return photoWithUser;
      
    } catch (error) {
      logger.error('포토존 사진 업로드 중 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자가 포토존 감지 범위 내에 있는지 확인
   * @param {string} photozoneId - 포토존 ID
   * @param {number} userLat - 사용자 위도
   * @param {number} userLng - 사용자 경도
   * @returns {boolean} 범위 내 여부
   */
  async checkUserInPhotozoneRange(photozoneId, userLat, userLng) {
    try {
      const photozone = await MarkingPhotozone.findByPk(photozoneId);
      
      if (!photozone) {
        return false;
      }

      // PostGIS ST_DWithin으로 감지 범위 확인
      const result = await sequelize.query(`
        SELECT ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326),
          detection_radius,
          true
        ) as in_range
        FROM marking_photozones 
        WHERE id = :photozoneId
      `, {
        replacements: {
          photozoneId,
          userLat,
          userLng
        },
        type: sequelize.QueryTypes.SELECT
      });

      return result[0]?.in_range || false;
      
    } catch (error) {
      logger.error('포토존 범위 확인 중 오류:', error);
      return false;
    }
  }
}

module.exports = new PhotoZoneService();
