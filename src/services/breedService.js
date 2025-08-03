const { Breed, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * 견종 관련 서비스
 */
class BreedService {

  /**
   * 키워드로 견종 검색
   * @param {string} keyword - 검색 키워드 (견종명)
   * @returns {Array} 검색된 견종 목록
   */
  async searchBreeds(keyword) {
    try {
      logger.debug('견종 검색 서비스 시작', { keyword });

      const breeds = await Breed.findAll({
        where: {
          name: { [Op.iLike]: `%${keyword}%` }
        },
        attributes: [
          'breedId',
          'name',
          'iconUrl'
        ],
        limit: 20,
        order: [['name', 'ASC']]
      });

      logger.debug('견종 검색 서비스 완료', { 
        keyword,
        resultCount: breeds.length 
      });

      return breeds.map(breed => ({
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl
      }));

    } catch (error) {
      logger.error('견종 검색 서비스 오류:', error);
      throw new Error('견종 검색 중 오류가 발생했습니다.');
    }
  }

  /**
   * 전체 견종 목록 조회
   * @param {Object} params - 검색 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지 크기
   * @returns {Object} 견종 목록 및 페이징 정보
   */
 async getAllBreeds({ page, size }) {
  try {
    logger.debug('전체 견종 목록 조회 서비스 시작', { page, size });

    const offset = (page - 1) * size;

    const { count, rows } = await Breed.findAndCountAll({
      attributes: [
        ['breed_id', 'breedId'],
        'name',
        ['icon_url', 'iconUrl']
      ],
      limit: size,
      offset: offset,
      order: [['name', 'ASC']]
    });

    logger.debug('전체 견종 목록 조회 서비스 완료', {
      resultCount: rows.length,
      totalCount: count
    });

    return {
      breeds: rows.map(breed => ({
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl
      })),
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / size),
      hasNext: page < Math.ceil(count / size),
      hasPrev: page > 1
    };

  } catch (error) {
    logger.error('전체 견종 목록 조회 서비스 오류:', error);
    throw new Error('전체 견종 목록 조회 중 오류가 발생했습니다.');
  }
}


  /**
   * 견종 ID로 상세 정보 조회
   * @param {string} breedId - 견종 ID
   * @returns {Object} 견종 상세 정보
   */
  async getBreedById(breedId) {
    try {
      logger.debug('견종 상세 정보 조회 서비스 시작', { breedId });

      const breed = await Breed.findByPk(breedId);

      if (!breed) {
        throw new Error('견종을 찾을 수 없습니다.');
      }

      logger.debug('견종 상세 정보 조회 서비스 완료', { breedId });

      return {
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl,
        createdAt: breed.createdAt,
        updatedAt: breed.updatedAt
      };

    } catch (error) {
      logger.error('견종 상세 정보 조회 서비스 오류:', error);
      if (error.message.includes('견종을 찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('견종 상세 정보 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 인기 견종 목록 조회 (사용자 등록 수 기준)
   * @param {number} limit - 조회할 견종 수
   * @returns {Array} 인기 견종 목록
   */
  async getPopularBreeds(limit) {
    try {
      logger.debug('인기 견종 목록 조회 서비스 시작', { limit });

      const breeds = await Breed.findAll({
        attributes: [
          'breedId',
          'name',
          'iconUrl',
          [
            Breed.sequelize.fn('COUNT', Breed.sequelize.col('Users.user_id')),
            'userCount'
          ]
        ],
        include: [{
          model: User,
          attributes: [],
          required: false
        }],
        group: ['Breed.breed_id'],
        order: [
          [Breed.sequelize.fn('COUNT', Breed.sequelize.col('Users.user_id')), 'DESC'],
          ['name', 'ASC']
        ],
        limit: limit
      });

      logger.debug('인기 견종 목록 조회 서비스 완료', { 
        resultCount: breeds.length
      });

      return breeds.map(breed => ({
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl,
        userCount: parseInt(breed.getDataValue('userCount')) || 0
      }));

    } catch (error) {
      logger.error('인기 견종 목록 조회 서비스 오류:', error);
      throw new Error('인기 견종 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 견종 정보 생성
   * @param {Object} breedData - 견종 데이터
   * @returns {Object} 생성된 견종 정보
   */
  async createBreed(breedData) {
    try {
      logger.debug('견종 정보 생성 서비스 시작', { breedData });

      const { name, iconUrl } = breedData;

      // 중복 견종명 확인
      const existingBreed = await Breed.findOne({
        where: { name: name }
      });

      if (existingBreed) {
        throw new Error('이미 존재하는 견종명입니다.');
      }

      const breed = await Breed.create({
        name,
        iconUrl
      });

      logger.debug('견종 정보 생성 서비스 완료', { 
        breedId: breed.breedId 
      });

      return {
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl
      };

    } catch (error) {
      logger.error('견종 정보 생성 서비스 오류:', error);
      if (error.message.includes('이미 존재하는 견종명입니다')) {
        throw error;
      }
      throw new Error('견종 정보 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 견종 정보 업데이트
   * @param {string} breedId - 견종 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Object} 업데이트된 견종 정보
   */
  async updateBreed(breedId, updateData) {
    try {
      logger.debug('견종 정보 업데이트 서비스 시작', { breedId, updateData });

      const breed = await Breed.findByPk(breedId);

      if (!breed) {
        throw new Error('견종을 찾을 수 없습니다.');
      }

      await breed.update(updateData);

      logger.debug('견종 정보 업데이트 서비스 완료', { breedId });

      return {
        breedId: breed.breedId,
        name: breed.name,
        iconUrl: breed.iconUrl
      };

    } catch (error) {
      logger.error('견종 정보 업데이트 서비스 오류:', error);
      if (error.message.includes('견종을 찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('견종 정보 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 견종 정보 삭제
   * @param {string} breedId - 견종 ID
   * @returns {boolean} 삭제 성공 여부
   */
  async deleteBreed(breedId) {
    try {
      logger.debug('견종 정보 삭제 서비스 시작', { breedId });

      const breed = await Breed.findByPk(breedId);

      if (!breed) {
        throw new Error('견종을 찾을 수 없습니다.');
      }

      // 해당 견종을 사용하는 사용자가 있는지 확인
      const userCount = await User.count({
        where: { breedId: breedId }
      });

      if (userCount > 0) {
        throw new Error('해당 견종을 사용하는 사용자가 있어 삭제할 수 없습니다.');
      }

      await breed.destroy();

      logger.debug('견종 정보 삭제 서비스 완료', { breedId });

      return true;

    } catch (error) {
      logger.error('견종 정보 삭제 서비스 오류:', error);
      if (error.message.includes('견종을 찾을 수 없습니다') || 
          error.message.includes('해당 견종을 사용하는 사용자가 있어')) {
        throw error;
      }
      throw new Error('견종 정보 삭제 중 오류가 발생했습니다.');
    }
  }
}

module.exports = new BreedService();
