const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WalkRecord = sequelize.define(
  "WalkRecord",
  {
    walk_record_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      comment: "산책 기록 고유 ID",
      field: 'walk_record_id'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "사용자 ID",
      field: 'user_id'
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "코스 ID (새 코스 산책 시 NULL)",
      field: 'course_id'
    },
    status: {
      type: DataTypes.ENUM(
        "STARTED",
        "PAUSED",
        "COMPLETED",
        "CANCELED",
        "ABANDONED"
      ),
      allowNull: false,
      defaultValue: "STARTED",
      comment: "산책 상태",
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "산책 시작 시간",
      field: 'start_time'
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "산책 종료 시간 (STARTED 또는 PAUSED 상태일 때는 NULL)",
      field: 'end_time'
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "산책 시간(초) - COMPLETED 상태에서 최종 계산",
      field: 'duration_seconds'
    },
    distance_meters: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "산책 거리(미터) - COMPLETED 상태에서 최종 계산",
      field: 'distance_meters'
    },
    path_coordinates: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "산책 경로 좌표 리스트 - 산책 중 지속 업데이트",
      field: 'path_coordinates'
    },
    path_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "실제 산책 경로 기반 이미지 URL", // 산책일지의 경로 이미지
      field: 'path_image_url'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "산책 일지 제목 - 자동 생성 또는 사용자 입력",
    },
    marking_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "마킹 횟수",
      field: 'marking_count'
    },
    tailcopter_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "꼬리콥터 점수",
      field: 'tailcopter_score'
    },
    is_course_registered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "코스 등록 여부",
      field: 'is_course_registered'
    },
    is_record_saved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "산책 일지 최종 저장 여부 (true: 저장 완료, false: 진행 중 또는 오류)",
      field: 'is_record_saved'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "walk_records",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: "산책 기록 테이블",
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["course_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["start_time"],
      },
      {
        fields: ["user_id", "status"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = WalkRecord;
