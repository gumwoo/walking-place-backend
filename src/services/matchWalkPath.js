// C:\walking-backend\src\services\matchWalkPath.js
const logger = require("../config/logger");
const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const { refineWalkPathWith100mLogic } = require("./walkPathRefinementService");

/**
 * 주어진 산책 기록의 좌표를 정제하고, 총 거리와 시간을 계산하여
 * walk_records 테이블에 업데이트하는 함수
 *
 * @param {string} walkRecordId - 업데이트할 산책 기록 ID
 * @returns {Promise<void>}
 */
const matchWalkPath = async (walkRecordId) => {
  logger.info(`경로 분석 시작 - walkRecordId: ${walkRecordId}`);

  try {
    const [walkInfo] = await sequelize.query(
      `SELECT walk_record_id, course_id FROM walk_records WHERE walk_record_id = :walkRecordId`,
      { replacements: { walkRecordId }, type: QueryTypes.SELECT }
    );

    const isFreeWalk = !walkInfo?.course_id;

    if (isFreeWalk) {
      console.log(`자유 산책 - 기준 경로 없이 일반 경로 생성: walkId=${walkRecordId}`);
      
      const t = await sequelize.transaction();

      try {
        await sequelize.query(
          `
          WITH raw AS (
            SELECT
              walk_record_id,
              (jsonb_array_elements(path_coordinates) ->> 0)::float8 AS lat,
              (jsonb_array_elements(path_coordinates) ->> 1)::float8 AS lon,
              (jsonb_array_elements(path_coordinates) ->> 2)::timestamptz AS ts
            FROM walk_records
            WHERE walk_record_id = :walkRecordId
          ),
          with_lag AS (
            SELECT
              walk_record_id,
              lat,
              lon,
              ts,
              LAG(lon) OVER (ORDER BY ts) AS prev_lon,
              LAG(lat) OVER (ORDER BY ts) AS prev_lat
            FROM raw
          ),
          filtered AS (
            SELECT *
            FROM with_lag
            WHERE prev_lon IS NULL OR
                  ST_DistanceSphere(ST_MakePoint(lon, lat), ST_MakePoint(prev_lon, prev_lat)) < 1000
          ),
          deduplicated AS (
            SELECT *
            FROM filtered
            WHERE NOT EXISTS (
              SELECT 1 FROM filtered AS f2
              WHERE f2.ts < filtered.ts
                AND f2.lon = filtered.lon
                AND f2.lat = filtered.lat
            )
          ),
          line AS (
            SELECT
              walk_record_id,
              ST_Segmentize(
                ST_MakeLine(ST_SetSRID(ST_MakePoint(lon, lat), 4326) ORDER BY ts),
                10
              ) AS path,
              MIN(ts) AS start_time,
              MAX(ts) AS end_time
            FROM deduplicated
            GROUP BY walk_record_id
          ),
          final AS (
            SELECT
              walk_record_id,
              path,
              ST_LengthSpheroid(path, 'SPHEROID["WGS 84",6378137,298.257223563]') AS distance_m,
              EXTRACT(EPOCH FROM (end_time - start_time))::int AS duration_s
            FROM line
          )
          UPDATE walk_records
          SET
            distance_meters = ROUND(final.distance_m::numeric, 2),
            duration_seconds = final.duration_s
          FROM final
          WHERE walk_records.walk_record_id = final.walk_record_id;
        `,
          { replacements: { walkRecordId }, transaction: t }
        );
        await t.commit();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } else {
      console.log(`기준 경로 있는 코스 산책 - 100m 로직으로 경로 정제: walkId=${walkRecordId}`);
      // 기존 20m 로직을 100m 로직으로 대체
      try {
        await refineWalkPathWith100mLogic(walkRecordId);
        console.log(`✅ walk ${walkRecordId} 100m 로직 정제 완료`);
      } catch (error) {
        console.error(`❌ walk ${walkRecordId} 100m 로직 정제 실패:`, error.message);
        // 실패해도 기본 분석은 완료된 상태이므로 에러 던지지 않음
      }
    }
  } catch (error) {
    logger.error("경로 분석 중 오류 발생:", { walkRecordId, error });
    throw error;
  }
};

module.exports = matchWalkPath;
