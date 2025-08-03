const { User, Location, Breed, Term, UserTermAgreement } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * 온보딩 관련 서비스
 */
class OnboardingService {

  /**
   * 사용자 약관 동의 상태 저장
   * @param {string} userId - 사용자 ID
   * @param {string[]} agreedTermIds - 동의한 약관 ID 목록
   * @returns {Object} 처리 결과
   */
  async saveTermAgreements(userId, agreedTermIds) {
    try {
      logger.info('사용자 약관 동의 저장 시작', { userId, termCount: agreedTermIds.length });

      // 1. 약관 ID 유효성 검사
      const validTerms = await Term.findAll({
        where: { id: { [Op.in]: agreedTermIds } }
      });

      if (validTerms.length !== agreedTermIds.length) {
        throw new Error('유효하지 않은 약관 ID가 포함되어 있습니다.');
      }

      // 2. 기존 동의 기록 삭제 (재동의 시)
      await UserTermAgreement.destroy({
        where: { user_id: userId }
      });

      // 3. 새로운 동의 기록 생성
      const agreementRecords = agreedTermIds.map(termId => ({
        user_id: userId,
        term_id: termId,
        agreed_at: new Date()
      }));

      await UserTermAgreement.bulkCreate(agreementRecords);

      logger.info('사용자 약관 동의 저장 완료', { userId, termCount: agreedTermIds.length });

      return {
        success: true,
        message: '약관 동의가 성공적으로 저장되었습니다.',
        agreedTermCount: agreedTermIds.length
      };

    } catch (error) {
      logger.error('사용자 약관 동의 저장 오류:', error);
      throw error;
    }
  }

  /**
   * 위치 검색
   * @param {string} keyword - 검색 키워드
   * @param {number} limit - 결과 제한 수
   * @returns {Array} 위치 목록
   */
  async searchLocations(keyword, limit = 10) {
    try {
      logger.info('위치 검색 시작', { keyword, limit });

      if (!keyword || keyword.trim().length < 1) {
        return [];
      }

      const locations = await Location.findAll({
        where: {
          [Op.or]: [
            { address_name: { [Op.iLike]: `%${keyword}%` } },
            { area_name: { [Op.iLike]: `%${keyword}%` } },
            { city: { [Op.iLike]: `%${keyword}%` } }
          ]
        },
        attributes: ['id', 'address_name', 'area_name', 'city', 'province'],
        limit: limit,
        order: [['address_name', 'ASC']]
      });

      logger.info('위치 검색 완료', { keyword, resultCount: locations.length });

      return locations.map(location => ({
        locationId: location.id,
        addressName: location.address_name,
        areaName: location.area_name,
        city: location.city,
        province: location.province
      }));

    } catch (error) {
      logger.error('위치 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 견종 검색
   * @param {string} keyword - 검색 키워드
   * @param {number} limit - 결과 제한 수
   * @returns {Array} 견종 목록
   */
  async searchBreeds(keyword, limit = 20) {
    try {
      logger.info('견종 검색 시작', { keyword, limit });

      if (!keyword || keyword.trim().length < 1) {
        // 키워드가 없으면 전체 견종 목록 반환
        const breeds = await Breed.findAll({
          attributes: ['id', 'name', 'icon_url'],
          limit: limit,
          order: [['name', 'ASC']]
        });

        return breeds.map(breed => ({
          breedId: breed.id,
          name: breed.name,
          iconUrl: breed.icon_url
        }));
      }

      const breeds = await Breed.findAll({
        where: {
          name: { [Op.iLike]: `%${keyword}%` }
        },
        attributes: ['breed_id', 'name', 'icon_url'],
        limit: limit,
        order: [['name', 'ASC']]
      });

      logger.info('견종 검색 완료', { keyword, resultCount: breeds.length });

      return breeds.map(breed => ({
        breedId: breed.id,
        name: breed.name,
        iconUrl: breed.icon_url
      }));

    } catch (error) {
      logger.error('견종 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 업데이트
   * @param {string} userId - 사용자 ID
   * @param {Object} profileData - 프로필 데이터
   * @returns {Object} 업데이트된 사용자 정보
   */
  async updateUserProfile(userId, profileData) {
    try {
      logger.info('사용자 프로필 업데이트 시작', { userId, fields: Object.keys(profileData) });

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 필드 매핑 (API 필드명 -> DB 필드명)
      const fieldMapping = {
        preferredLocationId: 'preferred_location_id',
        petName: 'dog_name',
        breedId: 'dog_breed', // 실제로는 breed ID가 아닌 breed name을 저장하는 구조
        petBirthDate: 'dog_birth_year', // Date -> Year로 변환 필요
        petSize: 'dog_size',
        petProfileImageUrl: 'dog_image'
      };

      const updateData = {};

      // 필드별 데이터 변환 및 검증
      for (const [apiField, dbField] of Object.entries(fieldMapping)) {
        if (profileData[apiField] !== undefined) {
          if (apiField === 'petBirthDate' && profileData[apiField]) {
            // 날짜를 연도로 변환
            const birthDate = new Date(profileData[apiField]);
            updateData[dbField] = birthDate.getFullYear();
          } else if (apiField === 'breedId' && profileData[apiField]) {
            // breedId로 breed name 조회
            const breed = await Breed.findByPk(profileData[apiField]);
            if (breed) {
              updateData[dbField] = breed.name;
            }
          } else {
            updateData[dbField] = profileData[apiField];
          }
        }
      }

      // 업데이트 실행
      await user.update(updateData);

      // 업데이트된 사용자 정보 조회 (관계 포함)
      const updatedUser = await User.findByPk(userId, {
        include: [
          {
            model: Location,
            as: 'preferredLocation',
            attributes: ['id', 'address_name', 'area_name', 'city']
          }
        ]
      });

      logger.info('사용자 프로필 업데이트 완료', { userId });

      return {
        userId: updatedUser.id,
        petName: updatedUser.dog_name,
        breedName: updatedUser.dog_breed,
        petBirthYear: updatedUser.dog_birth_year,
        petSize: updatedUser.dog_size,
        petProfileImageUrl: updatedUser.dog_image,
        preferredLocation: updatedUser.preferredLocation ? {
          locationId: updatedUser.preferredLocation.id,
          addressName: updatedUser.preferredLocation.address_name,
          areaName: updatedUser.preferredLocation.area_name,
          city: updatedUser.preferredLocation.city
        } : null
      };

    } catch (error) {
      logger.error('사용자 프로필 업데이트 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} 사용자 프로필 정보
   */
  async getUserProfile(userId) {
    try {
      logger.info('사용자 프로필 조회 시작', { userId });

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Location,
            as: 'preferredLocation',
            attributes: ['id', 'address_name', 'area_name', 'city']
          }
        ]
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      logger.info('사용자 프로필 조회 완료', { userId });

      return {
        userId: user.id,
        petName: user.dog_name,
        breedName: user.dog_breed,
        petBirthYear: user.dog_birth_year,
        petSize: user.dog_size,
        petProfileImageUrl: user.dog_image,
        preferredLocation: user.preferredLocation ? {
          locationId: user.preferredLocation.id,
          addressName: user.preferredLocation.address_name,
          areaName: user.preferredLocation.area_name,
          city: user.preferredLocation.city
        } : null
      };

    } catch (error) {
      logger.error('사용자 프로필 조회 오류:', error);
      throw error;
    }
  }
}

module.exports = new OnboardingService();
