const { User, Term, UserTermAgreement } = require("../models");
const logger = require("../config/logger");

class userService {
  // ✅ [GET] /api/v1/users/me/walk-records?page=&size=&sortBy=
  async getWalkRecords(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
      const sortBy = req.query.sortBy || "tailcopterScore";

      const offset = (page - 1) * size;

      const { count, rows } = await WalkRecord.findAndCountAll({
        where: { userId, status: "COMPLETED" },
        order: [[sortBy, "DESC"]],
        offset,
        limit: size,
      });

      return ApiResponse.success(
        res,
        {
          totalCount: count,
          currentPage: page,
          walkRecords: rows,
        },
        "산책일지 목록 조회 성공"
      );
    } catch (err) {
      console.error("산책일지 목록 조회 오류:", err);
      return ApiResponse.serverError(
        res,
        "산책일지 목록 조회 중 오류가 발생했습니다.",
        err
      );
    }
  }

  // ✅ 요약 프로필 조회
  async getSummaryProfile(userId) {
    logger.info("요약 프로필 조회", { userId });

    const user = await User.findOne({
      where: { userId },
      attributes: ["petName", "petProfileImageUrl"],
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    return {
      petName: user.petName,
      petProfileImageUrl: user.petProfileImageUrl,
    };
  }

  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          "userId",
          "socialType",
          "isTermsAgreed",
          "preferredLocationId",
          "petName",
          "breedId",
          "petBirthDate",
          "petSize",
          "petProfileImageUrl",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!user) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      return user;
    } catch (err) {
      throw err;
    }
  }
  
  // 약관 동의 저장
  async agreeToTerms(userId, agreedTermIds) {
    try {
      logger.info("약관 동의 저장", { userId, agreedTermIds });
  
      // 입력 검증
      if (!agreedTermIds || !Array.isArray(agreedTermIds) || agreedTermIds.length === 0) {
        throw new Error("동의한 약관 ID 목록이 필요합니다.");
      }
  
      // 약관 ID들이 실제로 존재하는지 확인
      const existingTerms = await Term.findAll({
        where: { id: agreedTermIds },
        attributes: ['id', 'title', 'isRequired']
      });
  
      if (existingTerms.length !== agreedTermIds.length) {
        throw new Error("존재하지 않는 약관 ID가 포함되어 있습니다.");
      }
  
      // 필수 약관이 모두 포함되어 있는지 확인
      const requiredTerms = existingTerms.filter(term => term.isRequired);
      const agreedRequiredTerms = requiredTerms.filter(term => 
        agreedTermIds.includes(term.id)
      );
  
      if (requiredTerms.length !== agreedRequiredTerms.length) {
        throw new Error("필수 약관에 동의하지 않았습니다.");
      }
  
      // 기존 약관 동의 기록 삭제 (재동의 시)
      await UserTermAgreement.destroy({
        where: { userId }
      });
  
      // 새로운 약관 동의 기록 생성
      const agreements = agreedTermIds.map(termId => ({
        userId,
        termId,
        agreedAt: new Date()
      }));
  
      await UserTermAgreement.bulkCreate(agreements);
  
      // 사용자의 약관 동의 상태 업데이트
      await User.update(
        { isTermsAgreed: true },
        { where: { userId } }
      );
  
      logger.info("약관 동의 저장 완료", { userId, agreementCount: agreements.length });
      return true;
  
    } catch (err) {
      logger.error("약관 동의 저장 오류", { error: err.message, userId });
      throw err;
    }
  }
  }

module.exports = new userService();
