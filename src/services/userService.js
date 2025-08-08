const {
  User,
  Term,
  UserTermAgreement,
  WalkRecord,
  Breed,
  Location,
} = require("../models");
const logger = require("../config/logger");

class userService {
  // ✅ [GET] /api/v1/users/me/walk-records?page=&size=&sortBy=
  async getWalkRecords(
    userId,
    { page = 1, size = 10, sortBy = "createdAt" } = {}
  ) {
    try {
      logger.info("산책일지 목록 조회", { userId, page, size, sortBy });

      const offset = (page - 1) * size;
      const { count, rows } = await WalkRecord.findAndCountAll({
        where: { user_id: userId, status: "COMPLETED" },
        order: [[sortBy, "DESC"]],
        offset,
        limit: size,
      });

      return {
        totalCount: count,
        currentPage: page,
        walkRecords: rows,
      };
    } catch (err) {
      logger.error("산책일지 목록 조회 오류", { error: err.message, userId });
      throw err; // 컨트롤러가 catch 하도록 예외만 던짐
    }
  }

  // ✅ 요약 프로필 조회
  async getSummaryProfile(userId) {
    logger.info("요약 프로필 조회", { userId });

    const user = await User.findOne({
      where: { user_id: userId }, // ✅ snake_case
      attributes: ["dog_name", "dog_image"], // ✅ snake_case
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    return {
      dog_name: user.dog_name, // ✅ camel로 변환해서 반환
      dog_image: user.dog_image,
    };
  }
async getProfile(userId) {
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id", // 실제 PK
        "oauth_provider", // 소셜 타입
        "preferred_location_id",
        "dog_name",
        "dog_breed",
        "dog_birth_year",
        "dog_size",
        "dog_image",
        "created_at",
        "updated_at",
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


// src/services/userService.js에 추가
async getAllTerms() {
  try {
    const terms = await Term.findAll({
      attributes: ['term_id', 'title', 'content', 'is_required', 'version'],
      order: [['is_required', 'DESC'], ['created_at', 'ASC']]
    });
    
    return terms;
  } catch (error) {
    logger.error('약관 목록 조회 실패:', error);
    throw error;
  }
}
  // 약관 동의 저장
  async agreeToTerms(userId, agreedTermIds) {
    try {
      logger.info("약관 동의 저장", { userId, agreedTermIds });

      // 입력 검증
      if (
        !agreedTermIds ||
        !Array.isArray(agreedTermIds) ||
        agreedTermIds.length === 0
      ) {
        throw new Error("동의한 약관 ID 목록이 필요합니다.");
      }

      // 약관 ID들이 실제로 존재하는지 확인
      const existingTerms = await Term.findAll({
        where: { term_id: agreedTermIds },
        attributes: ["term_id", "title", "is_required"],
      });

      if (existingTerms.length !== agreedTermIds.length) {
        throw new Error("존재하지 않는 약관 ID가 포함되어 있습니다.");
      }

      // 필수 약관이 모두 포함되어 있는지 확인
      const requiredTerms = existingTerms.filter((term) => term.is_required);
      const agreedRequiredTerms = requiredTerms.filter((term) =>
        agreedTermIds.includes(term.term_id)
      );

      if (requiredTerms.length !== agreedRequiredTerms.length) {
        throw new Error("필수 약관에 동의하지 않았습니다.");
      }

      // 기존 약관 동의 기록 삭제 (재동의 시)
      await UserTermAgreement.destroy({
        where: { user_id: userId },
      });

      // 새로운 약관 동의 기록 생성
      const agreements = agreedTermIds.map((termId) => ({
        user_id: userId,
        term_id: termId,
        agreed_at: new Date(),
      }));

      await UserTermAgreement.bulkCreate(agreements);

      // 사용자의 약관 동의 상태 업데이트
      await User.update({ isTermsAgreed: true }, { where: { id: userId } });

      logger.info("약관 동의 저장 완료", {
        userId,
        agreementCount: agreements.length,
      });
      return true;
    } catch (err) {
      logger.error("약관 동의 저장 오류", { error: err.message, userId });
      throw err;
    }
  }

  /**
   * 사용자 프로필 업데이트
   * @param {string} userId - 사용자 ID
   * @param {Object} profileData - 프로필 데이터
   * @returns {Object} 업데이트된 사용자 정보
   */
  async updateProfile(userId, profileData) {
    try {
      logger.info("사용자 프로필 업데이트 시작", {
        userId,
        fields: Object.keys(profileData),
      });

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      // 필드 매핑 (API 필드명 -> DB 필드명)
      const fieldMapping = {
        preferredLocationId: "preferred_location_id",
        petName: "dog_name",
        breedId: "dog_breed", // 실제로는 breed ID가 아닌 breed name을 저장하는 구조
        petBirthDate: "dog_birth_year", // Date -> Year로 변환 필요
        petSize: "dog_size",
        petProfileImageUrl: "dog_image",
      };

      const updateData = {};

      // 필드별 데이터 변환 및 검증
      for (const [apiField, dbField] of Object.entries(fieldMapping)) {
        if (profileData[apiField] !== undefined) {
          if (apiField === "petBirthDate" && profileData[apiField]) {
            // 날짜를 연도로 변환
            const birthDate = new Date(profileData[apiField]);
            updateData[dbField] = birthDate.getFullYear();
          } else if (apiField === "breedId" && profileData[apiField]) {
            // breedId로 breed name 조회
            const breed = await Breed.findByPk(profileData[apiField]);
            if (breed) {
              updateData[dbField] = breed.name;
            }
          } else {
            updateData[dbField] = profileData[apiField];
          }
        }
      }

      // 업데이트 실행
      await user.update(updateData);

      // 업데이트된 사용자 정보 조회 (관계 포함)
      const updatedUser = await User.findByPk(userId, {
        include: [
          {
            model: Location,
            as: "preferredLocation",
            attributes: ["location_id", "address_name", "area_name", "city"],
          },
        ],
      });

      logger.info("사용자 프로필 업데이트 완료", { userId });

      return {
        userId: updatedUser.id,
        petName: updatedUser.dog_name,
        breedName: updatedUser.dog_breed,
        petBirthYear: updatedUser.dog_birth_year,
        petSize: updatedUser.dog_size,
        petProfileImageUrl: updatedUser.dog_image,
        preferredLocation: updatedUser.preferredLocation
          ? {
              locationId: updatedUser.preferredLocation.id,
              addressName: updatedUser.preferredLocation.address_name,
              areaName: updatedUser.preferredLocation.area_name,
              city: updatedUser.preferredLocation.city,
            }
          : null,
      };
    } catch (error) {
      logger.error("사용자 프로필 업데이트 오류:", error);
      throw error;
    }
  }
}

module.exports = new userService();
