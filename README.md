# 🐕 산책명소 (Walking Places) - 백엔드 API

반려견 산책 코스 추천 및 공유 플랫폼의 백엔드 API 서버입니다.

## 📋 프로젝트 개요

- **목적**: 반려견과 함께하는 산책 코스를 추천하고 공유하는 플랫폼
- **주요 기능**: GPS 기반 코스 추천, 산책 기록, 포토존, 꼬리점수 시스템
- **개발 기간**: 2025년 7월 ~

## 🛠 기술 스택

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + PostGIS
- **ORM**: Sequelize
- **Authentication**: Passport.js (JWT, OAuth)

### Development Tools
- **API Documentation**: Swagger UI
- **Logging**: Winston
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git (GitHub Flow)

## 🏗 프로젝트 구조

```
walking-backend/
├── .github/                    # GitHub 템플릿
│   ├── ISSUE_TEMPLATE/         # 이슈 템플릿
│   └── pull_request_template.md
├── src/
│   ├── config/                 # 설정 파일
│   │   ├── database.js
│   │   ├── logger.js
│   │   ├── passport.js
│   │   └── swagger.js
│   ├── controllers/            # 컨트롤러 (MVC)
│   ├── middlewares/            # 미들웨어
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/                 # Sequelize 모델 (9개 테이블)
│   ├── routes/                 # API 라우트
│   ├── services/               # 비즈니스 로직
│   ├── utils/                  # 유틸리티
│   │   └── response.js
│   ├── validations/            # 입력 검증
│   └── app.js                  # Express 앱 설정
├── logs/                       # 로그 파일
├── uploads/                    # 업로드된 파일
├── tests/                      # 테스트 파일
├── docs/                       # 프로젝트 문서
└── server.js                   # 서버 진입점
```

## 🗄 데이터베이스 스키마

총 **9개 테이블**로 구성:

1. **users** - 사용자 (OAuth 인증 + 반려견 정보)
2. **courses** - 산책 코스
3. **course_reports** - 코스 신고
4. **course_features** - 코스 특징 (9가지)
5. **course_feature_mappings** - 코스-특징 매핑 (N:M)
6. **walks** - 산책 기록
7. **walk_photos** - 산책 사진 (경로/마킹)
8. **marking_photozones** - 마킹포토존
9. **photozone_photos** - 포토존 사진

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/walking-backend.git
cd walking-backend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=walking_places
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. 데이터베이스 설정
PostgreSQL + PostGIS 확장을 설치하고 데이터베이스를 생성하세요:

```sql
CREATE DATABASE walking_places;
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:5000/api-docs
- **API 상태**: http://localhost:5000/api/health

## 🔐 인증 시스템

### 지원하는 인증 방식
- **JWT Bearer Token**: API 접근용
- **OAuth 2.0**: 소셜 로그인
  - 카카오 OAuth
  - 구글 OAuth

### 인증 흐름
1. OAuth 로그인 → JWT 토큰 발급
2. API 요청 시 `Authorization: Bearer <token>` 헤더 포함
3. 토큰 만료 시 리프레시 토큰으로 갱신

## 🧪 브랜치 전략 (GitHub Flow)

```
1. main 브랜치에서 기능 브랜치 생성
   git checkout -b feature/api-authentication

2. 기능 개발 후 커밋 & 푸시
   git add .
   git commit -m "feat: JWT 인증 시스템 구현"
   git push origin feature/api-authentication

3. Pull Request 생성 및 코드 리뷰

4. 리뷰 승인 후 main에 머지

5. 기능 브랜치 삭제
```

### 브랜치명 규칙
- `feature/기능명`: 새 기능 개발
- `fix/버그명`: 버그 수정
- `refactor/리팩터링명`: 코드 리팩터링
- `docs/문서명`: 문서 업데이트

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 특정 테스트 파일 실행
npm test -- --grep "User API"
```

## 📝 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩터링
test: 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 설정 등
```

## 🤝 기여 방법

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 및 머지

## 📞 문의

- **Email**: support@walkingplaces.com
- **Issues**: [GitHub Issues](https://github.com/your-username/walking-backend/issues)

## 📄 라이선스

This project is licensed under the MIT License.

---

**개발팀**: Walking Places Backend Team  
**최종 업데이트**: 2025-07-03
