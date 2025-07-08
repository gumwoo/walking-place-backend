const { sequelize } = require('../config/database');

// "산책 종료 시점 이후 경로 분석 및 저장"을 담당
async function matchWalkPath(walkId) {
  await sequelize.query(`
    WITH coords AS (
      SELECT
        id,
        (jsonb_array_elements(raw_coordinates) ->> 'lng')::float8 AS lon,
        (jsonb_array_elements(raw_coordinates) ->> 'lat')::float8 AS lat,
        (jsonb_array_elements(raw_coordinates) ->> 'timestamp')::timestamptz AS ts
      FROM walks
      WHERE id = :walkId
    ),
    line AS (
      SELECT
        id,
        ST_MakeLine(ST_SetSRID(ST_MakePoint(lon, lat), 4326) ORDER BY ts) AS path,
        MIN(ts) AS start_time,
        MAX(ts) AS end_time
      FROM coords
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
  `, {
    replacements: { walkId },
  });

  console.log(`✅ walk ${walkId} 분석 완료`);
}


module.exports = { matchWalkPath };
