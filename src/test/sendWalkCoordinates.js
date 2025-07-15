const axios = require("axios");

// 테스트할때 터미널에서 node src/test/sendWalkCoordinates.js 입력
// 테스트할 walk ID
const walkId = "walk-test-001";

// API 엔드포인트
const endpoint = `http://localhost:3000/walk/${walkId}/coordinate`;

// 3초 간격 좌표 샘플 (전북대 캠퍼스 기준)
const coordinates = [
  { lat: 35.84584, lng: 127.12985, timestamp: "2025-07-14T12:00:00Z" },
  { lat: 35.84578, lng: 127.12999, timestamp: "2025-07-14T12:00:03Z" },
  { lat: 35.84571, lng: 127.13012, timestamp: "2025-07-14T12:00:06Z" },
  { lat: 35.84564, lng: 127.13023, timestamp: "2025-07-14T12:00:09Z" },
  { lat: 35.84554, lng: 127.13033, timestamp: "2025-07-14T12:00:12Z" },
  { lat: 35.84542, lng: 127.13048, timestamp: "2025-07-14T12:00:15Z" },
  { lat: 35.84528, lng: 127.13061, timestamp: "2025-07-14T12:00:18Z" },
  { lat: 35.84513, lng: 127.13072, timestamp: "2025-07-14T12:00:21Z" },
  { lat: 35.84497, lng: 127.13083, timestamp: "2025-07-14T12:00:24Z" },
  { lat: 35.84476, lng: 127.13095, timestamp: "2025-07-14T12:00:27Z" },
  { lat: 35.84460, lng: 127.13103, timestamp: "2025-07-14T12:00:30Z" },
  { lat: 35.84441, lng: 127.13111, timestamp: "2025-07-14T12:00:33Z" },
  { lat: 35.84415, lng: 127.13130, timestamp: "2025-07-14T12:00:36Z" },
  { lat: 35.84395, lng: 127.13138, timestamp: "2025-07-14T12:00:39Z" }
];

// 3초 간격으로 API 호출
async function sendCoordinates() {
  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i];

    try {
      const res = await axios.post(endpoint, coord);
      console.log(`✅ [${i + 1}] 좌표 전송 성공:`, res.data.message);
    } catch (err) {
      console.error(`❌ [${i + 1}] 좌표 전송 실패:`, err.message);
    }

    if (i < coordinates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초 대기
    }
  }

  console.log("📍 모든 좌표 전송 완료");
}

sendCoordinates();
