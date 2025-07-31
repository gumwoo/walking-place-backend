const { User } = require("../models");
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
}

module.exports = new userService();
