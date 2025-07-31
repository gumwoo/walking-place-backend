const fs = require('fs');
const path = require('path');

/**
 * ✅ [GET] /api/v1/breeds?search=...
 * 전체 견종 목록 조회 (검색어 필터 포함)
 */
const getAllBreeds = async (req, res) => {
  try {
    const { search } = req.query;

    const filePath = path.join(__dirname, '../dog-breed-crawler/korean_dog_breeds.json');

    if (!search || search.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '검색어(search)를 입력해주세요.',
        code: 'MISSING_QUERY'
      });
    }

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({
        success: false,
        message: '견종 정보 파일이 존재하지 않습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }

    // 파일 읽기
    const rawData = fs.readFileSync(filePath, 'utf8');

    // JSON 파싱
    let breedData;
    try {
      breedData = JSON.parse(rawData);
    } catch (parseErr) {
      return res.status(500).json({
        success: false,
        message: '견종 정보 파싱에 실패했습니다.',
        code: 'JSON_PARSE_ERROR'
      });
    }

    // 데이터 유효성 확인
    if (!breedData || !Array.isArray(breedData.all_breeds)) {
      return res.status(500).json({
        success: false,
        message: '올바르지 않은 견종 데이터 형식입니다.',
        code: 'INVALID_DATA_FORMAT'
      });
    }

    // 검색어 적용
    let filteredBreeds = breedData.all_breeds;
    if (search && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      filteredBreeds = filteredBreeds.filter(breed =>
        breed.toLowerCase().includes(keyword)
      );
    }

    return res.status(200).json({
      success: true,
      message: '견종 목록 조회 성공',
      data: {
        total: filteredBreeds.length,
        breeds: filteredBreeds
      }
    });

  } catch (err) {
    console.error('견종 정보 조회 실패:', err);
    return res.status(500).json({
      success: false,
      message: '견종 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.',
      code: 'INTERNAL_SERVER_ERROR',
      error: err.message
    });
  }
};

module.exports = {
  getAllBreeds
};
