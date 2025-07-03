# 프로젝트 구조

## 폴더 구조
```
walking-backend/
├── docs/                     # 프로젝트 문서
│   ├── project_plan.md      # 프로젝트 계획서
│   ├── api_design.md        # API 설계 문서
│   ├── database_schema.md   # 데이터베이스 스키마
│   └── project_structure.md # 프로젝트 구조 문서
├── src/                     # 소스 코드
│   ├── controllers/         # 컨트롤러
│   ├── services/           # 비즈니스 로직
│   ├── models/             # 데이터 모델
│   ├── routes/             # 라우터
│   ├── middleware/         # 미들웨어
│   ├── utils/              # 유틸리티 함수
│   ├── config/             # 설정 파일
│   └── app.js              # Express 앱 설정
├── logs/                   # 로그 파일
├── uploads/                # 업로드된 파일
├── tests/                  # 테스트 파일
├── package.json           # npm 패키지 설정
├── .env                   # 환경 변수
├── .gitignore            # Git 무시 파일
└── server.js             # 서버 진입점
```

## 기술 스택
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + 카카오 OAuth
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **API Documentation**: Swagger

## 주요 라이브러리
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.32.1",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "sharp": "^0.32.1",
    "joi": "^17.9.2",
    "winston": "^3.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "jest": "^29.6.1",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1"
  }
}
```

## 환경 변수 (.env)
```
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_NAME=walking_places
DB_USER=root
DB_PASSWORD=password

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 파일 업로드 설정
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

# 로그 설정
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

## API 엔드포인트 그룹화
### 1. 인증 관련 (auth)
- `/api/auth/*`

### 2. 사용자 관리 (users)
- `/api/users/*`

### 3. 코스 관리 (courses)
- `/api/courses/*`

### 4. 산책 기록 (walks)
- `/api/walks/*`

### 5. 마킹포토존 (marking-spots)
- `/api/marking-spots/*`

### 6. 파일 업로드 (upload)
- `/api/upload/*`

## 개발 방법론
1. **코드 구조**: MVC 패턴
2. **에러 처리**: 중앙 집중식 에러 핸들링
3. **로깅**: 모든 API 요청/응답 로깅
4. **보안**: Helmet, CORS, JWT 인증
5. **검증**: Joi를 이용한 입력 데이터 검증
6. **테스트**: 단위 테스트 및 통합 테스트

## 다음 개발 단계
1. 프로젝트 초기 설정 (package.json, 기본 구조)
2. 데이터베이스 연결 및 모델 설정
3. 인증 시스템 구현
4. 핵심 API 구현
5. 파일 업로드 시스템 구현
6. 테스트 작성
7. API 문서화
