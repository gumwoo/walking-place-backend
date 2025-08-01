const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MarkingPhoto = sequelize.define(
  "MarkingPhoto",
  {
    photoId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      comment: "마킹 사진 고유 ID",
    },
    photozoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "마킹 포토존 ID",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "사용자 ID",
    },
    walkRecordId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "산책 기록 ID",
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "이미지 URL",
    },
    takenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "사진 촬영 시간",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "marking_photos",
    timestamps: true,
    comment: "마킹 사진 테이블",
    indexes: [
      {
        fields: ["photozone_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["taken_at"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = MarkingPhoto;
