const { sequelize } = require("../config/database");
const { refineWalkPathWith20mLogic } = require("./walkPathRefinementService");

async function matchWalkPath(walkId) {
  const [walkInfo] = await sequelize.query(
    `SELECT id, course_id FROM walks WHERE id = :walkId`,
    { replacements: { walkId }, type: sequelize.QueryTypes.SELECT }
  );

  const isFreeWalk = !walkInfo?.course_id;

  if (isFreeWalk) {
    console.log(`자유 산책 - 기준 경로 없이 일반 경로 생성: walkId=${walkId}`);

    await sequelize.query(
      `
      WITH raw AS (
        SELECT
          id,
          (jsonb_array_elements(raw_coordinates) ->> 'lng')::float8 AS lon,
          (jsonb_array_elements(raw_coordinates) ->> 'lat')::float8 AS lat,
          (jsonb_array_elements(raw_coordinates) ->> 'timestamp')::timestamptz AS ts
        FROM walks
        WHERE id = :walkId
      ),
      with_lag AS (
        SELECT *, LAG(lon) OVER (ORDER BY ts) AS prev_lon,
               LAG(lat) OVER (ORDER BY ts) AS prev_lat
        FROM raw
      ),
      filtered AS (
        SELECT * FROM with_lag
        WHERE prev_lon IS NULL OR
              ST_DistanceSphere(ST_MakePoint(lon, lat), ST_MakePoint(prev_lon, prev_lat)) < 1000
      ),
      deduplicated AS (
        SELECT * FROM filtered
        WHERE NOT EXISTS (
          SELECT 1 FROM filtered AS f2
          WHERE f2.ts < filtered.ts
            AND f2.lon = filtered.lon
            AND f2.lat = filtered.lat
        )
      ),
      line AS (
        SELECT
          id,
          ST_Segmentize(
            ST_MakeLine(ST_SetSRID(ST_MakePoint(lon, lat), 4326) ORDER BY ts),
            10  -- 💡 10m 이하로 쪼개서 부드러운 경로
          ) AS path,
          MIN(ts) AS start_time,
          MAX(ts) AS end_time
        FROM deduplicated
        GROUP BY id
      ),

      final AS (
        SELECT
          id,
          path,
          ST_LengthSpheroid(path, 'SPHEROID["WGS 84",6378137,298.257223563]') AS distance_m,
          EXTRACT(EPOCH FROM (end_time - start_time))::int AS duration_s
        FROM line
      )
      UPDATE walks
      SET
        walk_path = final.path,
        total_distance = ROUND(final.distance_m::numeric, 2),
        total_time = final.duration_s
      FROM final
      WHERE walks.id = final.id;
    `,
      { replacements: { walkId } }
    );
  } else {
    console.log(
      `기준 경로 있는 코스 산책 - 스냅핑 포함 분석: walkId=${walkId}`
    );
    // 현재 작성한 스냅핑 + 필터 + distance 계산 쿼리 실행
    await sequelize.query(`... (스냅핑 포함 쿼리) ...`, {
      replacements: { walkId },
    });

    // 20m 이탈 감지 로직으로 경로 정제
    try {
      await refineWalkPathWith20mLogic(walkId);
      console.log(`✅ walk ${walkId} 20m 로직 정제 완료`);
    } catch (error) {
      console.error(`❌ walk ${walkId} 20m 로직 정제 실패:`, error.message);
      // 20m 로직 실패해도 기본 분석은 완료된 상태이므로 에러 던지지 않음
    }
  }
}

module.exports = { matchWalkPath };