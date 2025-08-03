const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MarkingPhoto = sequelize.define(
  "MarkingPhoto",
  {
    photo_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      comment: "마킹 사진 고유 ID",
      field: 'photo_id'
    },
    photozone_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "마킹 포토존 ID",
      field: 'photozone_id'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "사용자 ID",
      field: 'user_id'
    },
    walk_record_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "산책 기록 ID",
      field: 'walk_record_id'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "이미지 URL",
      field: 'image_url'
    },
    taken_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "사진 촬영 시간",
      field: 'taken_at'
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
    tableName: "marking_photos",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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
