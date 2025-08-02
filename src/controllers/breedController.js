const breedService = require('../services/breedService');
const logger = require('../config/logger');

/**
 * 견종 관련 컨트롤러
 * API 스펙 기준으로 구현
 */
class BreedController {

  /**
   * 견종 검색
   * GET /api/v1/breeds/search?keyword={keyword}
   */
  async searchBreeds(req, res) {
    try {
      logger.info('견종 검색 요청 시작');
      
      const { keyword } = req.query;
      
      if (!keyword || keyword.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '검색 키워드가 필요합니다.',
          code: 'MISSING_KEYWORD'
        });
      }

      if (keyword.length < 1) {
        return res.status(400).json({
          success: false,
          message: '검색 키워드는 최소 1자 이상 입력해주세요.',
          code: 'KEYWORD_TOO_SHORT'
        });
      }

      const breeds = await breedService.searchBreeds(keyword);
      
      logger.info('견종 검색 성공', { 
        keyword,
        count: breeds.length 
      });
      
      return res.status(200).json({
        success: true,
        message: '견종 검색을 성공적으로 완료했습니다.',
        data: breeds
      });

    } catch (error) {
      logger.error('견종 검색 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '견종 검색 중 오류가 발생했습니다.',
        code: 'BREED_SEARCH_ERROR'
      });
    }
  }

  /**
   * 전체 견종 목록 조회
   * GET /api/v1/breeds
   */
  async getAllBreeds(req, res) {
    try {
      logger.info('전체 견종 목록 조회 요청 시작');
      
      const { page = 1, size = 50 } = req.query;

      const result = await breedService.getAllBreeds({
        page: parseInt(page),
        size: parseInt(size)
      });
      
      logger.info('전체 견종 목록 조회 성공', { 
        count: result.breeds.length,
        totalCount: result.totalCount
      });
      
      return res.status(200).json({
        success: true,
        message: '전체 견종 목록을 성공적으로 조회했습니다.',
        data: result
      });

    } catch (error) {
      logger.error('전체 견종 목록 조회 실패:', error);
      
      return res.status(500).json({
        success: false,
        message: '전체 견종 목록 조회 중 오류가 발생했습니다.',
        code: 'ALL_BREEDS_ERROR'
      });
    }
  }
}

module.exports = new BreedController();
