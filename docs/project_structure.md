# 프로젝트 구조

## 폴더 구조
```
walking-backend/
├── .github/                    # GitHub 템플릿
│   ├── ISSUE_TEMPLATE/         # 이슈 템플릿
│   │   ├── bug_report.md       # 버그 리포트
│   │   ├── feature_request.md  # 기능 요청
│   │   └── question.md         # 질문
│   └── pull_request_template.md # PR 템플릿
├── docs/                       # 프로젝트 문서
│   ├── project_plan.md         # 프로젝트 계획서
│   ├── api_design.md           # API 설계 문서
│   ├── database_schema.md      # 데이터베이스 스키마
│   └── project_structure.md    # 프로젝트 구조 문서
├── src/                        # 소스 코드
│   ├── config/                 # 설정 파일
│   │   ├── database.js         # 데이터베이스 설정
│   │   ├── logger.js           # 로거 설정
│   │   ├── passport.js         # Passport.js 인증 설정
│   │   └── swagger.js          # Swagger 설정
│   ├── controllers/            # 컨트롤러 (MVC)
│   ├── services/               # 비즈니스 로직
│   ├── models/                 # Sequelize 모델 (9개)
│   │   ├── User.js             # 사용자 모델
│   │   ├── Course.js           # 코스 모델
│   │   ├── CourseReport.js     # 코스 신고 모델
│   │   ├── CourseFeature.js    # 코스 특징 모델
│   │   ├── CourseFeatureMapping.js # 코스-특징 매핑
│   │   ├── Walk.js             # 산책 기록 모델
│   │   ├── WalkPhoto.js        # 산책 사진 모델
│   │   ├── MarkingPhotozone.js # 마킹포토존 모델
│   │   ├── PhotozonePhoto.js   # 포토존 사진 모델
│   │   └── index.js            # 모델 관계 설정
│   ├── routes/                 # API 라우터
│   │   └── index.js            # 기본 라우트
│   ├── middlewares/            # 미들웨어
│   │   ├── auth.js             # 인증 미들웨어
│   │   └── errorHandler.js     # 에러 핸들러
│   ├── utils/                  # 유틸리티 함수
│   │   └── response.js         # 응답 통일 유틸리티
│   ├── validations/            # 입력 검증
│   └── app.js                  # Express 앱 설정
├── logs/                       # 로그 파일
├── uploads/                    # 업로드된 파일
├── tests/                      # 테스트 파일
├── package.json                # npm 패키지 설정
├── .env                        # 환경 변수
├── .gitignore                  # Git 무시 파일
├── README.md                   # 프로젝트 설명서
└── server.js                   # 서버 진입점
```

## 기술 스택
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + PostGIS
- **ORM**: Sequelize
- **Authentication**: Passport.js (JWT + OAuth)
- **OAuth Providers**: 카카오, 구글
- **API Documentation**: Swagger UI
- **Logging**: Winston
- **File Upload**: 추후 구현 예정
- **Validation**: 추후 구현 예정
- **Testing**: 추후 구현 예정

## 주요 라이브러리
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.37.1",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-kakao": "^1.0.1",
    "passport-google-oauth20": "^2.0.0",
    "jsonwebtoken": "^9.0.2",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "winston": "^3.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## 환경 변수 (.env)
```
# 서버 설정
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# 데이터베이스 설정 (PostgreSQL + PostGIS)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walking_places
DB_USER=postgres
DB_PASSWORD=1234567
DB_DIALECT=postgres

# JWT 설정
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_change_in_production
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 파일 업로드 설정
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp

# 로그 설정
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# CORS 설정
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## API 엔드포인트 그룹화
### 1. 시스템 (system)
- `/api/` - API 상태 확인
- `/api/health` - 헬스 체크
- `/api-docs` - Swagger UI

### 2. 인증 관련 (auth)
- `/api/auth/*` - 추후 구현

### 3. 사용자 관리 (users)
- `/api/users/*` - 추후 구현

### 4. 코스 관리 (courses)
- `/api/courses/*` - 추후 구현

### 5. 산책 기록 (walks)
- `/api/walks/*` - 추후 구현

### 6. 마킹포토존 (photozones)
- `/api/photozones/*` - 추후 구현

### 7. 파일 업로드 (upload)
- `/api/upload/*` - 추후 구현

## 개발 방법론
1. **브랜치 전략**: GitHub Flow
2. **코드 구조**: MVC 패턴
3. **에러 처리**: 중앙 집중식 에러 핸들링 (errorHandler 미들웨어)
4. **응답 통일**: ApiResponse 유틸리티 사용
5. **로깅**: Winston을 이용한 구조화된 로깅
6. **보안**: Helmet, CORS, JWT 인증, Rate Limiting
7. **API 문서화**: Swagger UI 자동 생성
8. **인증**: Passport.js (JWT + OAuth)

## 개발 상태
### ✅ 완료된 작업
1. ✅ 프로젝트 초기 설정 (package.json, 기본 구조)
2. ✅ 데이터베이스 연결 및 모델 설정 (9개 테이블)
3. ✅ GitHub 인프라 구축 (템플릿, 문서화)
4. ✅ 기본 미들웨어 구현 (인증, 에러처리, 응답통일)
5. ✅ Swagger API 문서화 설정
6. ✅ Passport.js 인증 시스템 기반 구축

### 🚧 다음 개발 단계
1. [ ] 인증 시스템 구현 (OAuth API)
2. [ ] 핵심 API 구현 (코스, 산책, 사용자)
3. [ ] 파일 업로드 시스템 구현
4. [ ] 입력 검증 시스템 구현
5. [ ] 테스트 작성
6. [ ] 배포 준비
