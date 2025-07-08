const { Course, User, CourseFeature } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * 코스 목록 조회 서비스
 * @param {Object} options - 조회 옵션
 * @param {string} options.sort - 정렬 필드
 * @param {string} options.order - 정렬 순서 (desc/asc)
 * @param {number} options.page - 페이지 번호
 * @param {number} options.limit - 페이지당 항목 수
 * @param {string} options.level - 코스 난이도 필터
 * @param {string} options.recommended_dog_size - 추천 반려견 크기 필터
 * @returns {Object} 코스 목록과 페이지네이션 정보
 */
const getCourseList = async (options) => {
  try {
    const {
      sort,
      order,
      page,
      limit,
      level,
      recommended_dog_size
    } = options;

    logger.info('코스 서비스 조회 시작:', options);

    // WHERE 조건 구성
    const whereConditions = {
      is_active: true  // 활성화된 코스만 조회
    };

    // 레벨 필터 추가
    if (level) {
      whereConditions.level = level;
      logger.info('레벨 필터 적용:', level);
    }

    // 추천 반려견 크기 필터 추가
    if (recommended_dog_size) {
      whereConditions.recommended_dog_size = recommended_dog_size;
      logger.info('반려견 크기 필터 적용:', recommended_dog_size);
    }

    // 정렬 옵션 구성
    const orderOptions = [];
    
    if (sort === 'average_tail_score') {
      orderOptions.push(['average_tail_score', order.toUpperCase()]);
      // 동점시 최신순으로 2차 정렬
      orderOptions.push(['created_at', 'DESC']);
    } else if (sort === 'created_at') {
      orderOptions.push(['created_at', order.toUpperCase()]);
    } else if (sort === 'distance') {
      orderOptions.push(['distance', order.toUpperCase()]);
      // 거리 동일시 꼬리점수 높은 순으로 2차 정렬
      orderOptions.push(['average_tail_score', 'DESC']);
    }

    logger.info('정렬 옵션 구성:', orderOptions);

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    logger.info('페이지네이션 계산:', { page, limit, offset });

    // 데이터베이스 조회
    const { count, rows } = await Course.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'dog_name', 'dog_breed', 'dog_size']
        },
        {
          model: CourseFeature,
          as: 'features',
          attributes: ['id', 'name'],
          through: { attributes: [] }  // 중간 테이블 속성 제외
        }
      ],
      attributes: [
        'id',
        'title',
        'average_tail_score',
        'total_tail_score',
        'review_count',
        'distance',
        'level',
        'recommended_dog_size',
        'thumbnail_image',
        'estimated_time',
        'created_at'
      ],
      order: orderOptions,
      limit: limit,
      offset: offset,
      distinct: true  // count 시 JOIN으로 인한 중복 방지
    });

    logger.info('데이터베이스 조회 완료:', {
      totalCount: count,
      returnedRows: rows.length,
      whereConditions,
      orderOptions
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNext,
      hasPrev
    };

    logger.info('페이지네이션 정보:', pagination);

    return {
      courses: rows,
      pagination
    };

  } catch (error) {
    logger.error('코스 목록 조회 서비스 오류:', {
      error: error.message,
      stack: error.stack,
      options
    });
    throw error;
  }
};

module.exports = {
  getCourseList
};
