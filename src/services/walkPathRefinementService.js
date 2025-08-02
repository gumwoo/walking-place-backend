const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * 100m 이탈 감지 로직을 통한 산책 경로 정제
 * @param {string} walkId - 산책 ID
 * @returns {Promise<void>}
 */
async function refineWalkPathWith100mLogic(walkId) {
  try {
    logger.info(`100m 로직 경로 정제 시작 - walkId: ${walkId}`);

    // 1단계: Walk 정보와 연결된 Course의 기준 경로 조회
    const [walkInfo] = await sequelize.query(`
      SELECT 
        w.id,
        w.course_id,
        w.raw_coordinates,
        c.path_geometry as course_path
      FROM walks w
      LEFT JOIN courses c ON w.course_id = c.id
      WHERE w.id = :walkId
    `, {
      replacements: { walkId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!walkInfo) {
      logger.warn(`Walk 정보를 찾을 수 없음 - walkId: ${walkId}`);
      return;
    }

    // 2단계: course_id가 없는 경우 (자유 산책) - 기존 경로 유지
    if (!walkInfo.course_id || !walkInfo.course_path) {
      logger.info(`자유 산책 또는 기준 경로 없음 - walkId: ${walkId}, 100m 로직 스킵`);
      return;
    }

    // 3단계: raw_coordinates가 없는 경우 처리
    if (!walkInfo.raw_coordinates || walkInfo.raw_coordinates.length === 0) {
      logger.warn(`GPS 좌표 데이터 없음 - walkId: ${walkId}`);
      return;
    }

    logger.info(`100m 로직 적용 대상 확인 - walkId: ${walkId}, 좌표 개수: ${walkInfo.raw_coordinates.length}`);

    // 4단계: 20m 이내 좌표 필터링 및 정제된 경로 생성
    await sequelize.query(`
      WITH coords AS (
        SELECT
          id,
          (jsonb_array_elements(raw_coordinates) ->> 'lng')::float8 AS lon,
          (jsonb_array_elements(raw_coordinates) ->> 'lat')::float8 AS lat,
          (jsonb_array_elements(raw_coordinates) ->> 'timestamp')::timestamptz AS ts,
          ROW_NUMBER() OVER (ORDER BY (jsonb_array_elements(raw_coordinates) ->> 'timestamp')::timestamptz) as coord_order
        FROM walks
        WHERE id = :walkId
      ),
      course_info AS (
        SELECT path_geometry as course_path
        FROM courses 
        WHERE id = (SELECT course_id FROM walks WHERE id = :walkId)
      ),
      filtered_coords AS (
        SELECT 
          coords.*,
          ST_SetSRID(ST_MakePoint(lon, lat), 4326) as gps_point,
          -- 기준 경로와의 거리 계산 (미터 단위)
          ST_Distance(
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
            course_info.course_path::geography
          ) as distance_to_course
        FROM coords, course_info
        WHERE ST_Distance(
          ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
          course_info.course_path::geography
        ) <= 100  -- 100m 이내만 필터링
      ),
      refined_line AS (
        SELECT
          id,
          CASE 
            WHEN COUNT(*) >= 2 THEN 
              ST_MakeLine(gps_point ORDER BY ts) 
            ELSE NULL 
          END AS refined_path,
          COUNT(*) as valid_points_count,
          MIN(distance_to_course) as min_distance,
          MAX(distance_to_course) as max_distance,
          AVG(distance_to_course) as avg_distance
        FROM filtered_coords
        GROUP BY id
      ),
      final_stats AS (
        SELECT
          id,
          refined_path,
          valid_points_count,
          min_distance,
          max_distance,
          avg_distance,
          CASE 
            WHEN refined_path IS NOT NULL THEN 
              ST_LengthSpheroid(refined_path, 'SPHEROID["WGS 84",6378137,298.257223563]')
            ELSE 0 
          END AS refined_distance_m
        FROM refined_line
      )
      UPDATE walks
      SET
        walk_path = COALESCE(final_stats.refined_path, walks.walk_path),
        total_distance = CASE 
          WHEN final_stats.refined_path IS NOT NULL THEN 
            ROUND(final_stats.refined_distance_m::numeric, 2)
          ELSE walks.total_distance 
        END
      FROM final_stats
      WHERE walks.id = final_stats.id
    `, {
      replacements: { walkId }
    });

    // 5단계: 정제 결과 로깅
    const [refinedResult] = await sequelize.query(`
      SELECT 
        total_distance,
        ST_NumPoints(walk_path) as path_points,
        jsonb_array_length(raw_coordinates) as raw_points
      FROM walks 
      WHERE id = :walkId
    `, {
      replacements: { walkId },
      type: sequelize.QueryTypes.SELECT
    });

    logger.info(`100m 로직 경로 정제 완료 - walkId: ${walkId}`, {
      originalPoints: refinedResult.raw_points,
      refinedPoints: refinedResult.path_points,
      finalDistance: refinedResult.total_distance
    });

  } catch (error) {
    logger.error(`100m 로직 경로 정제 실패 - walkId: ${walkId}`, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * 100m 이탈 구간 분석 (선택적 기능)
 * @param {string} walkId - 산책 ID
 * @returns {Promise<Object>} 이탈 구간 통계
 */
async function analyze100mDeviations(walkId) {
  try {
    logger.info(`100m 이탈 구간 분석 시작 - walkId: ${walkId}`);

    const [deviationStats] = await sequelize.query(`
      WITH coords AS (
        SELECT
          (jsonb_array_elements(raw_coordinates) ->> 'lng')::float8 AS lon,
          (jsonb_array_elements(raw_coordinates) ->> 'lat')::float8 AS lat,
          (jsonb_array_elements(raw_coordinates) ->> 'timestamp')::timestamptz AS ts
        FROM walks
        WHERE id = :walkId
      ),
      course_info AS (
        SELECT path_geometry as course_path
        FROM courses 
        WHERE id = (SELECT course_id FROM walks WHERE id = :walkId)
      ),
      distance_analysis AS (
        SELECT 
          ST_Distance(
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
            course_info.course_path::geography
          ) as distance_to_course,
          CASE 
            WHEN ST_Distance(
              ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
              course_info.course_path::geography
            ) > 100 THEN 1 
            ELSE 0 
          END as is_deviation
        FROM coords, course_info
      )
      SELECT
        COUNT(*) as total_points,
        SUM(is_deviation) as deviation_points,
        ROUND((SUM(is_deviation)::float / COUNT(*)::float * 100)::numeric, 2) as deviation_percentage,
        ROUND(MIN(distance_to_course)::numeric, 2) as min_distance,
        ROUND(MAX(distance_to_course)::numeric, 2) as max_distance,
        ROUND(AVG(distance_to_course)::numeric, 2) as avg_distance
      FROM distance_analysis
    `, {
      replacements: { walkId },
      type: sequelize.QueryTypes.SELECT
    });

    logger.info(`100m 이탈 구간 분석 완료 - walkId: ${walkId}`, deviationStats);

    return deviationStats;

  } catch (error) {
    logger.error(`100m 이탈 구간 분석 실패 - walkId: ${walkId}`, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  refineWalkPathWith100mLogic,
  analyze100mDeviations
};