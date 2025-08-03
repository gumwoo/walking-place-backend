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
        attributes: ['location_id', 'address_name', 'area_name', 'city', 'province'],
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

    const attributes = [
      ['breed_id', 'breedId'],
      'name',
      ['icon_url', 'iconUrl']
    ];

    // 키워드가 없거나 빈 문자열인 경우 → 전체 목록 일부 반환
    if (!keyword || keyword.trim().length < 1) {
      const breeds = await Breed.findAll({
        attributes,
        limit,
        order: [['name', 'ASC']]
      });

      return breeds.map(breed => ({
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl
      }));
    }

    // 키워드 검색
    const breeds = await Breed.findAll({
      where: {
        name: { [Op.iLike]: `%${keyword}%` }
      },
      attributes,
      limit,
      order: [['name', 'ASC']]
    });

    logger.info('견종 검색 완료', { keyword, resultCount: breeds.length });

    return breeds.map(breed => ({
      breedId: breed.breedId,
      name: breed.name,
      iconUrl: breed.iconUrl
    }));

  } catch (error) {
    logger.error('견종 검색 오류:', error);
    throw new Error('견종 검색 중 오류가 발생했습니다.');
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
