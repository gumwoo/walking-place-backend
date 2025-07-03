/**
 * API 응답 통일 유틸리티
 * 모든 API 응답을 일관된 형태로 반환
 */

class ApiResponse {
  /**
   * 성공 응답
   * @param {Object} res - Express response 객체
   * @param {any} data - 응답 데이터
   * @param {string} message - 성공 메시지
   * @param {number} statusCode - HTTP 상태 코드 (기본: 200)
   */
  static success(res, data = null, message = '성공', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 실패 응답
   * @param {Object} res - Express response 객체
   * @param {string} message - 오류 메시지
   * @param {number} statusCode - HTTP 상태 코드 (기본: 400)
   * @param {any} error - 오류 상세 정보
   */
  static error(res, message = '오류가 발생했습니다', statusCode = 400, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    // 개발 환경에서만 에러 상세 정보 포함
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * 생성 성공 응답 (201)
   * @param {Object} res - Express response 객체
   * @param {any} data - 생성된 데이터
   * @param {string} message - 성공 메시지
   */
  static created(res, data = null, message = '생성되었습니다') {
    return this.success(res, data, message, 201);
  }

  /**
   * 업데이트 성공 응답 (200)
   * @param {Object} res - Express response 객체
   * @param {any} data - 업데이트된 데이터
   * @param {string} message - 성공 메시지
   */
  static updated(res, data = null, message = '업데이트되었습니다') {
    return this.success(res, data, message, 200);
  }

  /**
   * 삭제 성공 응답 (200)
   * @param {Object} res - Express response 객체
   * @param {string} message - 성공 메시지
   */
  static deleted(res, message = '삭제되었습니다') {
    return this.success(res, null, message, 200);
  }

  /**
   * 페이지네이션 응답
   * @param {Object} res - Express response 객체
   * @param {Array} data - 데이터 배열
   * @param {Object} pagination - 페이지네이션 정보
   * @param {string} message - 성공 메시지
   */
  static paginated(res, data, pagination, message = '조회되었습니다') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.itemsPerPage,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 인증 오류 응답 (401)
   * @param {Object} res - Express response 객체
   * @param {string} message - 오류 메시지
   */
  static unauthorized(res, message = '인증이 필요합니다') {
    return this.error(res, message, 401);
  }

  /**
   * 권한 오류 응답 (403)
   * @param {Object} res - Express response 객체
   * @param {string} message - 오류 메시지
   */
  static forbidden(res, message = '권한이 없습니다') {
    return this.error(res, message, 403);
  }

  /**
   * 찾을 수 없음 응답 (404)
   * @param {Object} res - Express response 객체
   * @param {string} message - 오류 메시지
   */
  static notFound(res, message = '요청한 리소스를 찾을 수 없습니다') {
    return this.error(res, message, 404);
  }

  /**
   * 유효성 검사 오류 응답 (422)
   * @param {Object} res - Express response 객체
   * @param {Array} errors - 유효성 검사 오류 배열
   * @param {string} message - 오류 메시지
   */
  static validationError(res, errors, message = '입력 데이터가 올바르지 않습니다') {
    return res.status(422).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 서버 오류 응답 (500)
   * @param {Object} res - Express response 객체
   * @param {string} message - 오류 메시지
   * @param {any} error - 오류 상세 정보
   */
  static serverError(res, message = '서버 내부 오류가 발생했습니다', error = null) {
    return this.error(res, message, 500, error);
  }
}

module.exports = ApiResponse;
