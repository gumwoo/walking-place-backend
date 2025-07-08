const logger = require('../config/logger');
const ApiResponse = require('../utils/response');

const matchWalkPathController = async (req, res) => {
  const { id } = req.params;

  logger.info(`산책 경로 분석 요청 - walkId: ${id}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    await matchWalkPath(id);

    logger.info(`산책 경로 분석 성공 - walkId: ${id}`);
    return ApiResponse.updated(res, null, '산책 경로가 분석되었습니다');
  } catch (error) {
    logger.error('산책 경로 분석 실패:', {
      walkId: id,
      error: error.message,
      stack: error.stack
    });

    return ApiResponse.serverError(res, '산책 경로 분석 중 오류가 발생했습니다', error);
  }
};

module.exports = {
  matchWalkPathController
};
