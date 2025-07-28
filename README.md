# 🐕 산책명소 (Walking Place)

반려동물 산책 코스 추천 및 공유 플랫폼 백엔드 API

## 📋 프로젝트 소개

산책명소는 반려동물과 함께하는 산책을 더욱 즐겁고 의미있게 만드는 서비스입니다.

### 🎯 주요 기능
- **🔐 카카오 소셜 로그인** - 간편한 회원가입 및 로그인
- **📍 GPS 산책 추적** - 실시간 경로 기록 및 저장
- **📸 마킹 포토존** - 특별한 장소에서 반려동물 사진 촬영
- **🎮 꼬리콥터 게임** - 산책 후 재미있는 미니게임으로 점수 획득
- **🗺️ 코스 추천** - 주변 추천 코스 및 사용자 생성 코스 공유
- **🐶 반려동물 프로필** - 견종별 맞춤 추천

## 🛠️ 기술 스택

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT + Kakao OAuth 2.0

### Infrastructure
- **File Storage**: Local/Cloud Storage
- **Logging**: Winston
- **API Documentation**: Swagger
- **Testing**: Jest + Supertest

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/gumwoo/walking-place-backend.git
cd walking-backend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
# 서버 설정
NODE_ENV=development
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walking_place
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

### 4. 데이터베이스 설정
```bash
# 마이그레이션 실행
npm run db:migrate

# 시드 데이터 삽입
npm run db:seed
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

서버가 성공적으로 시작되면 `http://localhost:5000`에서 접근할 수 있습니다.

## 📖 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

### 주요 API 엔드포인트

#### 🔐 인증
```
POST /api/v1/auth/kakao           # 카카오 로그인
POST /api/v1/auth/token/refresh   # 토큰 갱신
```

#### 👤 사용자
```
GET  /api/v1/users/me/profile            # 프로필 조회
PUT  /api/v1/users/me/profile            # 프로필 업데이트
POST /api/v1/users/me/terms              # 약관 동의
GET  /api/v1/users/me/summary-profile    # 프로필 요약
```

#### 🚶‍♂️ 산책
```
POST   /api/v1/walk-records                    # 산책 시작
PATCH  /api/v1/walk-records/{id}/track         # 경로 업데이트
PUT    /api/v1/walk-records/{id}/end           # 산책 종료
GET    /api/v1/users/me/walk-records           # 산책 기록 목록
PUT    /api/v1/walk-records/{id}/score         # 꼬리콥터 점수
```

#### 🗺️ 코스
```
GET  /api/v1/courses/recommendations    # 추천 코스 목록
GET  /api/v1/courses/{id}               # 코스 상세 정보
POST /api/v1/courses                    # 새 코스 등록
```

#### 📍 위치 & 견종
```
GET /api/v1/locations/search    # 위치 검색
GET /api/v1/breeds/search       # 견종 검색
GET /api/v1/breeds              # 전체 견종 목록
```

## 🗂️ 프로젝트 구조

```
walking-backend/
├── docs/                   # 문서
│   └── project_plan.md     # 프로젝트 계획서
├── logs/                   # 로그 파일
├── src/
│   ├── app.js             # Express 앱 설정
│   ├── config/            # 설정 파일
│   │   ├── database.js    # DB 설정
│   │   └── logger.js      # 로깅 설정
│   ├── controllers/       # 컨트롤러
│   ├── models/            # Sequelize 모델
│   ├── routes/            # API 라우터
│   ├── services/          # 비즈니스 로직
│   ├── middlewares/       # 미들웨어
│   └── utils/             # 유틸리티
├── tests/                 # 테스트 파일
├── uploads/               # 업로드 파일
├── server.js              # 서버 엔트리 포인트
├── package.json
└── README.md
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 📊 데이터베이스 스키마

### 주요 엔티티
- **User**: 사용자 및 반려동물 정보
- **WalkRecord**: 산책 기록 및 GPS 데이터
- **Course**: 산책 코스 정보
- **MarkingPhotozone**: 마킹 포토존
- **Location**: 위치 정보
- **Breed**: 견종 정보

자세한 ERD는 `docs/` 폴더의 관련 문서를 참조하세요.

## 🔧 개발 스크립트

```bash
npm run dev              # 개발 서버 (nodemon)
npm start               # 프로덕션 서버
npm test                # 테스트 실행
npm run lint            # ESLint 검사
npm run lint:fix        # ESLint 자동 수정
npm run db:migrate      # DB 마이그레이션
npm run db:seed         # 시드 데이터 삽입
npm run crawl:breeds    # 견종 데이터 크롤링
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 언제든 연락주세요.

**프로젝트 링크**: [https://github.com/gumwoo/walking-place-backend](https://github.com/gumwoo/walking-place-backend)

---

**Made with ❤️ for 🐕 by Walking Place Team**
