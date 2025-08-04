// C:\walking-backend\src\services\markingPhotozoneService.js

const { MarkingPhotozone, MarkingPhoto, User, Breed } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize'); // Op 객체를 가져옵니다.

/**
 * 마킹 포토존 관련 서비스
 */
class MarkingPhotozoneService {

  /**
   * 마킹 포토존 상세 정보 조회
   * @param {string} photozoneId - 포토존 ID
   * @param {string} currentUserId - 현재 사용자 ID (engagementTextData용)
   * @returns {Object} 포토존 상세 정보
   */
  async getPhotozoneDetails(photozoneId, currentUserId) {
    try {
      logger.info('마킹 포토존 상세 정보 조회 서비스 시작', { photozoneId });

      // 1. 포토존 정보 조회
      const photozone = await MarkingPhotozone.findByPk(photozoneId);
      if (!photozone) {
        throw new Error('지정된 마킹 포토존을 찾을 수 없습니다.');
      }

      // 2. 해당 포토존의 모든 사진 조회 (최신순, 업로더 정보 포함)
      const photos = await MarkingPhoto.findAll({
        where: { photozoneId },
        include: [
          {
            model: User,
            as: 'user', // 별칭을 'user'로 수정
            attributes: ['dog_name', 'dog_birth_year', 'dog_image', 'dog_breed'],
            required: true
          }
        ],
        attributes: ['photoId', 'imageUrl', 'takenAt', 'userId'],
        order: [['takenAt', 'DESC']]
      });

      // 3. engagementTextData 계산
      const engagementTextData = await this.calculateEngagementData(photozoneId, currentUserId);

      // 4. 응답 데이터 구성
      const formattedPhotos = photos.map(photo => {
        // 반려견 나이 계산
        let petAge = null;
        if (photo.user && photo.user.dog_birth_year) {
          const birthYear = parseInt(photo.user.dog_birth_year, 10);
          const today = new Date();
          petAge = today.getFullYear() - birthYear;
        }

        return {
          photoId: photo.photoId,
          photoUrl: photo.imageUrl,
          uploadedAt: photo.takenAt,
          uploader: {
            profileImageUrl: photo.user.dog_image,
            petName: photo.user.dog_name,
            petBreed: photo.user.dog_breed, // dog_breed 속성 사용
            petAge: petAge
          }
        };
      });

      logger.info('마킹 포토존 상세 정보 조회 서비스 완료', {
        photozoneId,
        photosCount: formattedPhotos.length
      });

      return {
        id: photozone.photozoneId,
        latitude: photozone.latitude,
        longitude: photozone.longitude,
        photos: formattedPhotos,
        engagementTextData
      };

    } catch (error) {
      logger.error('마킹 포토존 상세 정보 조회 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 기존 포토존에 사진 추가
   * @param {string} photozoneId - 포토존 ID
   * @param {string} photoUrl - 사진 URL
   * @param {string} userId - 사용자 ID
   * @returns {Object} 추가된 사진 정보
   */
  async addPhotoToPhotozone(photozoneId, photoUrl, userId) {
    try {
      logger.info('기존 포토존에 사진 추가 서비스 시작', { photozoneId, userId });

      // 1. 포토존 존재 여부 확인
      const photozone = await MarkingPhotozone.findByPk(photozoneId);
      if (!photozone) {
        throw new Error('지정된 마킹 포토존을 찾을 수 없습니다.');
      }

      // 2. 새로운 마킹 사진 생성
      const newPhoto = await MarkingPhoto.create({
        photozoneId,
        userId,
        imageUrl: photoUrl,
        takenAt: new Date()
      });

      logger.info('기존 포토존에 사진 추가 서비스 완료', {
        photozoneId,
        photoId: newPhoto.photoId
      });

      return {
        photoId: newPhoto.photoId,
        photozoneId: photozoneId
      };

    } catch (error) {
      logger.error('기존 포토존에 사진 추가 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * engagementTextData 계산 (이전 방문자 정보)
   * @param {string} photozoneId - 포토존 ID
   * @param {string} currentUserId - 현재 사용자 ID
   * @returns {Object} engagement 데이터
   */
  async calculateEngagementData(photozoneId, currentUserId) {
    try {
      // 현재 사용자를 제외한 가장 최근 방문자 찾기
      const recentVisitor = await MarkingPhoto.findOne({
        where: {
          photozoneId: photozoneId,
          userId: { [Op.ne]: currentUserId }
        },
        include: [
          {
            model: User,
            as: 'user', // 별칭을 'user'로 수정
            attributes: ['dog_name'], // 'petName'을 'dog_name'으로 수정
            required: true
          }
        ],
        order: [['takenAt', 'DESC']] // created_at 대신 takenAt 사용
      });

      if (!recentVisitor) {
        return {
          previousVisitorPetName: null,
          previousVisitTimeAgo: null
        };
      }

      // 시간 차이 계산
      const now = new Date();
      const visitTime = new Date(recentVisitor.takenAt); // takenAt 사용
      const diffMs = now - visitTime;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo;
      if (diffHours < 1) {
        timeAgo = "방금";
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}시간 전`;
      } else if (diffDays < 7) {
        timeAgo = `${diffDays}일 전`;
      } else {
        timeAgo = "1주일 이상 전";
      }

      return {
        previousVisitorPetName: recentVisitor.user.dog_name, // uploader 별칭에 맞춰 수정
        previousVisitTimeAgo: timeAgo
      };

    } catch (error) {
      logger.error('engagementTextData 계산 오류:', error);
      return {
        previousVisitorPetName: null,
        previousVisitTimeAgo: null
      };
    }
  }
}

// 클래스 정의 중복 제거
module.exports = new MarkingPhotozoneService();
