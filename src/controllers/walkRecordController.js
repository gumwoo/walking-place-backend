const logger = require("../config/logger");
const WalkRecord = require("../models/WalkRecord");
const ApiResponse = require("../utils/response");
const { Op } = require("sequelize");
const matchWalkPath = require("../services/matchWalkPath"); // 실제 경로 분석 함수
const Course = require("../models/Course");
const MarkingPhoto = require("../models/MarkingPhoto");
const User = require("../models/User");
const { MarkingPhotozone } = require("../models");

const walkRecordController = {
  // ✅ 산책 시작 API (NEW_COURSE or 자유 산책)
  async startWalk(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;
      const { walkType, courseId } = req.body;

      const startTime = new Date();
      const walkDate = startTime.toISOString().slice(0, 10); // YYYY-MM-DD

      // NEW_COURSE → 자유 산책, courseId 없이
      // EXISTING_COURSE → 추천 코스 산책
      const newWalk = await WalkRecord.create({
        userId,
        courseId: walkType === "EXISTING_COURSE" ? courseId : null,
        status: "STARTED",
        startTime,
        walkDate,
        pathCoordinates: [], // 초기 빈 경로
        markingCount: 0,
        isCourseRegistered: false,
      });

      return ApiResponse.created(
        res,
        {
          walkRecordId: newWalk.walkRecordId,
          status: newWalk.status,
          startTime: newWalk.startTime,
        },
        "산책이 시작되었습니다."
      );
    } catch (error) {
      console.error("산책 시작 오류:", error);
      return ApiResponse.serverError(
        res,
        "산책 시작 중 오류가 발생했습니다.",
        error
      );
    }
  },

  // ✅ [PATCH] /api/v1/walk-records/:walkRecordId/path  산책 경로 좌표 및 데이터 주기적 업데이트
  async updateTrack(req, res) {
    try {
      const { walkRecordId } = req.params;
      const { currentPathCoordinates } = req.body;

      // 유효성 검사 강화: 배열 + 각 요소가 [number, number]인지 확인
      const isValidCoordinate = (coord) =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === "number" &&
        typeof coord[1] === "number";

      if (
        !Array.isArray(currentPathCoordinates) ||
        !currentPathCoordinates.every(isValidCoordinate)
      ) {
        return ApiResponse.validationError(
          res,
          null,
          "currentPathCoordinates는 [위도, 경도] 쌍의 배열이어야 합니다."
        );
      }

      const walkRecord = await WalkRecord.findByPk(walkRecordId);

      if (!walkRecord) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      // 기존 좌표에 누적
      const updatedCoordinates = Array.isArray(walkRecord.pathCoordinates)
        ? [...walkRecord.pathCoordinates, ...currentPathCoordinates]
        : [...currentPathCoordinates];

      walkRecord.pathCoordinates = updatedCoordinates;
      await walkRecord.save();

      return ApiResponse.updated(
        res,
        null,
        "좌표가 성공적으로 저장되었습니다."
      );
    } catch (error) {
      console.error("좌표 저장 오류:", error);
      return ApiResponse.serverError(
        res,
        "좌표 저장 중 오류가 발생했습니다.",
        error
      );
    }
  },

  // ✅ 산책 상태 변경 API (일시정지, 재시작 등)
  // [PATCH] /api/v1/walk-records/{walk_record_id}/status
  async updateStatus(req, res) {
    try {
      const walkRecordId = req.params.walkRecordId;
      const userId = req.user?.id || process.env.TEST_USER_ID;
      const { status } = req.body;

      // 1. userId 유효성 검사
      if (!userId) {
        return ApiResponse.unauthorized(res, "인증된 사용자 정보가 없습니다.");
      }

      // 2. 상태 값 검사
      const validStatuses = [
        "STARTED",
        "COMPLETED",
        "CANCELED",
        "PAUSED",
        "RESUMED",
      ];
      if (typeof status !== "string" || !validStatuses.includes(status)) {
        console.warn("유효하지 않은 상태값 수신됨:", status);
        return ApiResponse.badRequest(
          res,
          `유효하지 않은 상태입니다: ${status}`
        );
      }

      // 3. 산책 기록 조회
      const walkRecord = await WalkRecord.findOne({
        where: {
          walk_record_id: walkRecordId,
          user_id: userId,
        },
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "산책 기록을 찾을 수 없습니다.");
      }

      // 4. 상태 업데이트
      walkRecord.status = status;
      await walkRecord.save();

      return ApiResponse.success(
        res,
        {
          walkRecordId,
          newStatus: status,
        },
        `산책 상태가 ${status}로 변경되었습니다.`
      );
    } catch (err) {
      console.error("산책 상태 변경 오류:", err?.message, err?.stack);
      return ApiResponse.serverError(
        res,
        "산책 상태 변경 중 오류가 발생했습니다.",
        err
      );
    }
  },

  // ✅ [PUT] /api/v1/walk-records/:walkRecordId/end (산책 종료)
  async endWalkRecord(req, res) {
    const { walkRecordId } = req.params;
    const userId = req.user?.id || process.env.TEST_USER_ID;

    logger.info(`산책 종료 요청 - walkRecordId: ${walkRecordId}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    try {
      const walkRecord = await WalkRecord.findOne({
        where: { walkRecordId, userId },
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "산책 기록을 찾을 수 없습니다.");
      }

      // 실제 경로 분석 함수 호출 (예: PostGIS 기반 등)
      await matchWalkPath(walkRecordId);

      // 종료 상태 업데이트
      await walkRecord.update({
        status: "COMPLETED",
        endTime: new Date(),
      });

      logger.info(
        `산책 종료 및 경로 분석 성공 - walkRecordId: ${walkRecordId}`
      );

      return ApiResponse.updated(
        res,
        null,
        "산책이 종료되고 경로가 분석되었습니다."
      );
    } catch (error) {
      logger.error("산책 종료 실패:", {
        walkRecordId,
        error: error.message,
        stack: error.stack,
      });

      return ApiResponse.serverError(
        res,
        "산책 종료 중 오류가 발생했습니다.",
        error
      );
    }
  },

  // ✅ [PUT] 꼬리콥터 점수 저장
  async updateScore(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;
      const walkRecordId = req.params.walkRecordId;
      const { tailcopterScore } = req.body;

      // UUID 형식 검사
      if (!isUuid(walkRecordId)) {
        return ApiResponse.badRequest(
          res,
          `유효하지 않은 walkRecordId 형식입니다: ${walkRecordId}`
        );
      }

      if (typeof tailcopterScore !== "number" || tailcopterScore < 0) {
        return ApiResponse.validationError(
          res,
          null,
          "tailcopterScore는 0 이상의 숫자여야 합니다."
        );
      }

      const walk = await WalkRecord.findOne({
        where: { walkRecordId, userId },
      });

      if (!walk) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      await walk.update({ tailcopterScore });

      return ApiResponse.updated(
        res,
        null,
        "꼬리콥터 점수가 성공적으로 저장되었습니다."
      );
    } catch (err) {
      console.error("꼬리콥터 점수 저장 오류:", err?.message, err?.stack);
      return ApiResponse.serverError(
        res,
        "꼬리콥터 점수 저장 중 오류가 발생했습니다.",
        {
          message: err?.message,
          stack: err?.stack,
        }
      );
    }
  },

  // ✅ [POST] /api/v1/walk-records/:walkRecordId/save - 산책기록 최종 저장 (산책일지 저장)
  async saveRecord(req, res) {
    try {
      const userId = req.user?.id || process.env.TEST_USER_ID;
      const walkRecordId = req.params.walkRecordId;

      const {
        title: requestTitle,
        walkDate,
        pathImageUrl,
        distanceMeters,
        markingCount,
        tailcopterScore,
      } = req.body;

      // WalkRecord + User(pet_name) + Course(courseName) 조인
      const walkRecord = await WalkRecord.findOne({
        where: { walkRecordId, userId },
        include: [
          { model: Course, as: "course", attributes: ["courseName"] },
          { model: User, as: "user", attributes: ["pet_name"] },
        ],
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      if (walkRecord.isRecordSaved) {
        return ApiResponse.badRequest(res, "이미 저장된 산책 기록입니다.");
      }

      // pet_name 가져오기 (User alias로 접근!)
      const petName = walkRecord.user?.get("pet_name") || "반려견";

      let generatedTitle = requestTitle;

      if (!requestTitle || requestTitle.trim() === "") {
        if (walkRecord.isCourseRegistered && walkRecord.course?.courseName) {
          generatedTitle = `${petName}와 함께한 ${walkRecord.course.courseName}`;
        } else {
          generatedTitle = `${petName}와 함께한 즐거운 산책`;
        }
      }

      // 확인용 로그
      console.log("✅ pet_name:", petName);
      console.log(
        "🐶 walkRecord.user JSON:",
        JSON.stringify(walkRecord.user, null, 2)
      );

      console.log("✅ 최종 title:", generatedTitle);

      // 업데이트
      await WalkRecord.update(
        {
          status: "COMPLETED",
          endTime: new Date(),
          distanceMeters,
          markingCount,
          tailcopterScore,
          title: generatedTitle,
          walkDate: walkDate || walkRecord.walkDate,
          pathImageUrl: pathImageUrl || walkRecord.pathImageUrl,
          isRecordSaved: true,
        },
        {
          where: { walkRecordId, userId },
        }
      );

      return ApiResponse.success(
        res,
        {
          walkRecordId,
          petName,
          title: generatedTitle,
        },
        "산책 기록이 성공적으로 저장되었습니다."
      );
    } catch (err) {
      console.error("산책 기록 저장 오류:", err);
      return ApiResponse.serverError(
        res,
        "산책 기록 저장 중 오류가 발생했습니다.",
        err
      );
    }
  },

 // 산책 경로 및 마킹 이미지 등 상세 정보 조회   /api/v1/walk-records/{walk_record_id}/details
async getDetails(req, res) {
  try {
    const walkRecordId = req.params.walkRecordId;
    const userId = req.user?.id || process.env.TEST_USER_ID;

    const walkRecord = await WalkRecord.findOne({
      where: {
        walkRecordId,
        userId,
        status: "COMPLETED",
        isRecordSaved: true,
      },
      include: [
        {
          model: Course,
          as: "course", // 코스 정보
        },
        {
          model: MarkingPhoto,
          as: "markingPhotos", // 마킹 사진 목록
          required: false,
          include: [
            {
              model: MarkingPhotozone,
              as: "photozone", // 각 마킹 사진의 포토존 정보
              required: false,
            },
          ],
        },
      ],
    });

    if (!walkRecord) {
      return ApiResponse.notFound(res, "해당 산책 일지를 찾을 수 없습니다.");
    }

    if (!walkRecord.pathImageUrl || walkRecord.pathImageUrl.trim() === "") {
      return ApiResponse.badRequest(res, "산책 경로 이미지가 존재하지 않습니다.");
    }

    return ApiResponse.success(res, walkRecord, "산책 일지 상세 조회 성공");
  } catch (err) {
    console.error("산책 일지 상세 조회 오류:", err);
    return ApiResponse.serverError(
      res,
      "산책 일지 상세 조회 중 오류가 발생했습니다.",
      err
    );
  }
},

};

module.exports = walkRecordController;