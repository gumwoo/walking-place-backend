// C:\walking-backend\src\controllers\walkRecordController.js

const logger = require("../config/logger");
const WalkRecord = require("../models/WalkRecord");
const ApiResponse = require("../utils/response");
const { Op } = require("sequelize");
const matchWalkPath = require("../services/matchWalkPath");
const Course = require("../models/Course");
const MarkingPhoto = require("../models/MarkingPhoto");
const User = require("../models/User");
const { MarkingPhotozone } = require("../models");

const walkRecordController = {
  /**
   * @swagger
   * /walk-records:
   *   post:
   *     summary: 산책 시작
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               walk_type:
   *                 type: string
   *                 enum: [EXISTING_COURSE, NEW_COURSE]
   *                 description: 산책 유형 (기존 코스 또는 자유 산책)
   *               course_id:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *                 description: EXISTING_COURSE 선택 시 필수, NEW_COURSE 시 NULL
   *             required:
   *               - walk_type
   *             example:
   *               walk_type: NEW_COURSE
   *     responses:
   *       '201':
   *         description: 산책이 성공적으로 시작되었습니다.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: 산책이 시작되었습니다.
   *                 data:
   *                   type: object
   *                   properties:
   *                     walk_record_id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                       enum: [STARTED, PAUSED, COMPLETED, CANCELED, ABANDONED]
   *                     start_time:
   *                       type: string
   *                       format: date-time
   *       '400':
   *         description: 잘못된 요청 (e.g., 코스 ID 누락)
   *       '401':
   *         description: 인증 실패
   *       '500':
   *         description: 서버 오류
   */
  async startWalk(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;

      if (!userId) {
        return ApiResponse.unauthorized(res, "유효한 사용자 ID가 없습니다.");
      }

      const { walk_type, course_id } = req.body;

      if (walk_type === "EXISTING_COURSE" && !course_id) {
        return ApiResponse.badRequest(res, "코스 ID가 필요합니다.");
      }

      const startTime = new Date();
      const walkDate = startTime.toISOString().slice(0, 10);

      const newWalk = await WalkRecord.create({
        user_id: userId,
        course_id: walk_type === "EXISTING_COURSE" ? course_id : null,
        status: "STARTED",
        start_time: startTime,
        walk_date: walkDate,
        path_coordinates: [],
        marking_count: 0,
        is_course_registered: false,
      });

      return ApiResponse.created(
        res,
        {
          walk_record_id: newWalk.walk_record_id,
          status: newWalk.status,
          start_time: newWalk.start_time,
        },
        "산책이 시작되었습니다."
      );
    } catch (error) {
      logger.error("산책 시작 중 오류가 발생했습니다.", { error });
      return ApiResponse.serverError(
        res,
        "산책 시작 중 오류가 발생했습니다.",
        error
      );
    }
  },

  /**
   * @swagger
   * /walk-records/{walkRecordId}/track:
   *   patch:
   *     summary: 산책 경로 및 데이터 주기적 업데이트
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currentPathCoordinates:
   *                 type: array
   *                 items:
   *                   type: array
   *                   items:
   *                     type: number
   *                 description: 현재까지의 누적 산책 경로 좌표
   *               currentDistanceMeters:
   *                 type: number
   *                 description: 현재까지의 누적 산책 거리 (미터)
   *               currentDurationSeconds:
   *                 type: number
   *                 description: 현재까지의 누적 산책 시간 (초)
   *             example:
   *               currentPathCoordinates: [[37.5665, 126.9780], [37.5667, 126.9782]]
   *               currentDistanceMeters: 1200
   *               currentDurationSeconds: 600
   *     responses:
   *       '200':
   *         description: 좌표가 성공적으로 저장되었습니다.
   *       '400':
   *         description: 잘못된 요청 (e.g., 좌표 형식이 올바르지 않음)
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async updateTrack(req, res) {
    try {
      const { walkRecordId } = req.params;
      const {
        currentPathCoordinates,
        currentDistanceMeters,
        currentDurationSeconds,
      } = req.body;
      const userId = req.user?.user_id || process.env.TEST_USER_ID;

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

      const walkRecord = await WalkRecord.findOne({
        where: { walk_record_id: walkRecordId, user_id: userId },
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      const updatedCoordinates = Array.isArray(walkRecord.path_coordinates)
        ? [...walkRecord.path_coordinates, ...currentPathCoordinates]
        : [...currentPathCoordinates];

      walkRecord.path_coordinates = updatedCoordinates;
      await walkRecord.save();

      return ApiResponse.updated(
        res,
        {
          coordinates: walkRecord.path_coordinates,
          distance: walkRecord.distance_meters,
          duration: walkRecord.duration_seconds,
        },
        "좌표가 성공적으로 저장되었습니다."
      );
    } catch (error) {
      logger.error("좌표 저장 중 오류가 발생했습니다.", { error });
      return ApiResponse.serverError(
        res,
        "좌표 저장 중 오류가 발생했습니다.",
        error
      );
    }
  },

  /**
   * @swagger
   * /walk-records/{walkRecordId}/status:
   *   patch:
   *     summary: 산책 상태 변경 (일시정지/재개 등)
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [STARTED, PAUSED, COMPLETED, CANCELED, ABANDONED]
   *                 description: 변경할 산책 상태
   *             example:
   *               status: PAUSED
   *     responses:
   *       '200':
   *         description: 산책 상태가 성공적으로 변경되었습니다.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: 산책 상태가 PAUSED로 변경되었습니다.
   *                 data:
   *                   type: object
   *                   properties:
   *                     walkRecordId:
   *                       type: string
   *                       format: uuid
   *                     newStatus:
   *                       type: string
   *                       enum: [STARTED, PAUSED, COMPLETED, CANCELED, ABANDONED]
   *       '400':
   *         description: 잘못된 요청 (유효하지 않은 상태값)
   *       '401':
   *         description: 인증 실패
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async updateStatus(req, res) {
    try {
      const walkRecordId = req.params.walkRecordId;
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
      const { status } = req.body;

      if (!userId) {
        return ApiResponse.unauthorized(res, "인증된 사용자 정보가 없습니다.");
      }

      const validStatuses = [
        "STARTED",
        "COMPLETED",
        "CANCELED",
        "PAUSED",
        "ABANDONED",
      ];
      if (typeof status !== "string" || !validStatuses.includes(status)) {
        logger.warn(`유효하지 않은 상태값 수신됨: ${status}`);
        return ApiResponse.badRequest(
          res,
          `유효하지 않은 상태입니다: ${status}`
        );
      }

      const walkRecord = await WalkRecord.findOne({
        where: {
          walk_record_id: walkRecordId,
          user_id: userId,
        },
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "산책 기록을 찾을 수 없습니다.");
      }

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
      logger.error("산책 상태 변경 중 오류가 발생했습니다.", { err });
      return ApiResponse.serverError(
        res,
        "산책 상태 변경 중 오류가 발생했습니다.",
        err
      );
    }
  },

  /**
   * @swagger
   * /walk-records/{walkRecordId}/end:
   *   put:
   *     summary: 산책 종료
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               finalDurationSeconds:
   *                 type: integer
   *                 description: 최종 산책 시간(초)
   *               finalDistanceMeters:
   *                 type: integer
   *                 description: 최종 산책 거리(미터)
   *               finalPathCoordinates:
   *                 type: array
   *                 items:
   *                   type: array
   *                   items:
   *                     type: number
   *                 description: 최종 산책 경로 좌표 리스트
   *             required:
   *               - finalDurationSeconds
   *               - finalDistanceMeters
   *               - finalPathCoordinates
   *             example:
   *               finalDurationSeconds: 3600
   *               finalDistanceMeters: 5000
   *               finalPathCoordinates: [[37.5665, 126.9780], [37.5667, 126.9782]]
   *     responses:
   *       '200':
   *         description: 산책이 성공적으로 종료되고 경로가 분석되었습니다.
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async endWalkRecord(req, res) {
    const { walkRecordId } = req.params;
    const userId = req.user?.user_id || process.env.TEST_USER_ID;

    logger.info(`산책 종료 요청 - walkRecordId: ${walkRecordId}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    try {
      const walkRecord = await WalkRecord.findOne({
        where: { walk_record_id: walkRecordId, user_id: userId },
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "산책 기록을 찾을 수 없습니다.");
      }

      await matchWalkPath(walkRecordId);

      const {
        finalDurationSeconds,
        finalDistanceMeters,
        finalPathCoordinates,
      } = req.body;

      await walkRecord.update({
        status: "COMPLETED",
        end_time: new Date(),
        duration_seconds: finalDurationSeconds,
        distance_meters: finalDistanceMeters,
        path_coordinates: finalPathCoordinates,
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

  /**
   * @swagger
   * /walk-records/{walkRecordId}/score:
   *   put:
   *     summary: 꿈리콥터 점수 저장
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tailcopterScore:
   *                 type: integer
   *                 minimum: 0
   *                 description: 꿈리콥터 게임 점수
   *             required:
   *               - tailcopterScore
   *             example:
   *               tailcopterScore: 12500
   *     responses:
   *       '200':
   *         description: 꿈리콥터 점수가 성공적으로 저장되었습니다.
   *       '400':
   *         description: 잘못된 요청 (e.g., 점수가 유효하지 않음)
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async updateScore(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
      const walkRecordId = req.params.walkRecordId;
      const { tailcopterScore } = req.body;

      if (typeof tailcopterScore !== "number" || tailcopterScore < 0) {
        return ApiResponse.validationError(
          res,
          null,
          "tailcopterScore는 0 이상의 숫자여야 합니다."
        );
      }

      const walk = await WalkRecord.findOne({
        where: { walk_record_id: walkRecordId, user_id: userId },
      });

      if (!walk) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      await walk.update({ tailcopter_score: tailcopterScore });

      return ApiResponse.updated(
        res,
        null,
        "꼬리콥터 점수가 성공적으로 저장되었습니다."
      );
    } catch (err) {
      logger.error("꼬리콥터 점수 저장 중 오류가 발생했습니다.", { err });
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

  /**
   * @swagger
   * /walk-records/{walkRecordId}/save:
   *   post:
   *     summary: 산책 기록 최종 저장 (일지 저장)
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 nullable: true
   *                 description: 산책 일지 제목 (미입력 시 자동 생성)
   *               walkDate:
   *                 type: string
   *                 format: date
   *                 nullable: true
   *                 description: 산책 날짜 (YYYY-MM-DD)
   *               pathImageUrl:
   *                 type: string
   *                 nullable: true
   *                 description: 산책 경로 이미지 URL
   *               distanceMeters:
   *                 type: integer
   *                 description: 최종 산책 거리(미터)
   *               markingCount:
   *                 type: integer
   *                 description: 최종 마킹 횟수
   *               tailcopterScore:
   *                 type: integer
   *                 description: 최종 꿈리콥터 점수
   *             required:
   *               - distanceMeters
   *               - markingCount
   *               - tailcopterScore
   *             example:
   *               title: '새로운 산책 일지'
   *               walkDate: '2023-10-27'
   *               pathImageUrl: 'http://example.com/path.png'
   *               distanceMeters: 5500
   *               markingCount: 3
   *               tailcopterScore: 12500
   *     responses:
   *       '200':
   *         description: 산책 기록이 성공적으로 저장되었습니다.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: 산책 기록이 성공적으로 저장되었습니다.
   *                 data:
   *                   type: object
   *                   properties:
   *                     walkRecordId:
   *                       type: string
   *                       format: uuid
   *                     petName:
   *                       type: string
   *                     title:
   *                       type: string
   *       '400':
   *         description: 잘못된 요청 (e.g., 이미 저장된 기록)
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async saveRecord(req, res) {
    try {
      const userId = req.user?.user_id || process.env.TEST_USER_ID;
      const walkRecordId = req.params.walkRecordId;

      const {
        title: requestTitle,
        walkDate,
        pathImageUrl,
        distanceMeters,
        markingCount,
        tailcopterScore,
      } = req.body;

      const walkRecord = await WalkRecord.findOne({
        where: { walk_record_id: walkRecordId, user_id: userId },
        include: [
          { model: Course, as: "course", attributes: ["course_name"] },
          { model: User, as: "user", attributes: ["dog_name"] },
        ],
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "해당 산책 기록을 찾을 수 없습니다.");
      }

      if (walkRecord.isRecordSaved) {
        return ApiResponse.badRequest(res, "이미 저장된 산책 기록입니다.");
      }

      const petName = walkRecord.user?.get("dog_name") || "반려견";
      let generatedTitle = requestTitle;

      if (!requestTitle || requestTitle.trim() === "") {
        if (walkRecord.isCourseRegistered && walkRecord.course?.courseName) {
          generatedTitle = `${petName}와 함께한 ${walkRecord.course.courseName}`;
        } else {
          generatedTitle = `${petName}와 함께한 즐거운 산책`;
        }
      }

      await WalkRecord.update(
        {
          status: "COMPLETED",
          end_time: new Date(),
          distance_meters: distanceMeters,
          marking_count: markingCount,
          tailcopter_score: tailcopterScore,
          title: generatedTitle,
          walk_date: walkDate || walkRecord.get("walk_date"),
          path_image_url: pathImageUrl || walkRecord.get("path_image_url"),
          is_record_saved: true,
        },
        {
          where: { walk_record_id: walkRecordId, user_id: userId },
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
      logger.error("산책 기록 저장 중 오류가 발생했습니다.", { err });
      return ApiResponse.serverError(
        res,
        "산책 기록 저장 중 오류가 발생했습니다.",
        err
      );
    }
  },

  /**
   * @swagger
   * /walk-records/{walkRecordId}/details:
   *   get:
   *     summary: 산책 일지 상세 정보 조회
   *     tags: [Walk Records]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walkRecordId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *           description: 산책 기록 고유 ID
   *     responses:
   *       '200':
   *         description: 산책 일지 상세 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 walk_record_id:
   *                   type: string
   *                   format: uuid
   *                 user_id:
   *                   type: string
   *                   format: uuid
   *                 course:
   *                   type: object
   *                   properties:
   *                     course_name:
   *                       type: string
   *                 markingPhotos:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       marking_photo_id:
   *                         type: string
   *                         format: uuid
   *                       photo_url:
   *                         type: string
   *                         format: url
   *                       photozone:
   *                         type: object
   *                         properties:
   *                           photozone_name:
   *                             type: string
   *                 path_image_url:
   *                   type: string
   *                   format: url
   *                 title:
   *                   type: string
   *       '400':
   *         description: 산책 경로 이미지가 존재하지 않습니다.
   *       '404':
   *         description: 산책 기록을 찾을 수 없습니다.
   *       '500':
   *         description: 서버 오류
   */
  async getDetails(req, res) {
    try {
      const walkRecordId = req.params.walkRecordId;
      const userId = req.user?.user_id || process.env.TEST_USER_ID;

      const walkRecord = await WalkRecord.findOne({
        where: {
          walk_record_id: walkRecordId,
          user_id: userId,
          status: "COMPLETED",
          is_record_saved: true,
        },
        include: [
          {
            model: Course,
            as: "course",
          },
          {
            model: MarkingPhoto,
            as: "markingPhotos",
            required: false,
            include: [
              {
                model: MarkingPhotozone,
                as: "photozone",
                required: false,
              },
            ],
          },
        ],
      });

      if (!walkRecord) {
        return ApiResponse.notFound(res, "해당 산책 일지를 찾을 수 없습니다.");
      }

      if (
        !walkRecord.path_image_url ||
        walkRecord.path_image_url.trim() === ""
      ) {
        return ApiResponse.badRequest(
          res,
          "산책 경로 이미지가 존재하지 않습니다."
        );
      }

      return ApiResponse.success(res, walkRecord, "산책 일지 상세 조회 성공");
    } catch (err) {
      logger.error("산책 일지 상세 조회 중 오류가 발생했습니다.", { err });
      return ApiResponse.serverError(
        res,
        "산책 일지 상세 조회 중 오류가 발생했습니다.",
        err
      );
    }
  },
};

module.exports = walkRecordController;
