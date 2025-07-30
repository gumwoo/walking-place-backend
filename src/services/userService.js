
class userService {
  
  
  // ✅ [GET] /api/v1/users/me/walk-records?page=&size=&sortBy=
  async getWalkRecords(req, res) {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
      const sortBy = req.query.sortBy || "tailcopterScore";

      const offset = (page - 1) * size;

      const { count, rows } = await WalkRecord.findAndCountAll({
        where: { userId, status: "COMPLETED" },
        order: [[sortBy, "DESC"]],
        offset,
        limit: size
      });

      return ApiResponse.success(res, {
        totalCount: count,
        currentPage: page,
        walkRecords: rows
      }, "산책일지 목록 조회 성공");
    } catch (err) {
      console.error("산책일지 목록 조회 오류:", err);
      return ApiResponse.serverError(res, "산책일지 목록 조회 중 오류가 발생했습니다.", err);
    }
  }

}

module.exports = new userService();