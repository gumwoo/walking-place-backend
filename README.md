# 산책멍소

반려동물 산책 코스 추천 및 공유 플랫폼 백엔드 API

## 프로젝트 소개

산책명소는 반려동물과 함께하는 산책을 더욱 즐겁고 의미있게 만드는 서비스입니다.

###  주요 기능
- ** 카카오 소셜 로그인** - 간편한 회원가입 및 로그인
- ** GPS 산책 추적** - 실시간 경로 기록 및 저장
- ** 마킹 포토존** - 특별한 장소에서 반려동물 사진 촬영
- ** 꼬리콥터** - 산책 후 산책코스 점수 입력
- ** 코스 추천** - 주변 추천 코스 및 사용자 생성 코스 공유
- ** 반려동물 프로필** - 견종별 맞춤 추천

## 기술 스택

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

## 설치 및 실행

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

## API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

### 주요 API 엔드포인트

#### A. 인증 및 온보딩
```
POST /api/v1/auth/kakao                           # 카카오 로그인/회원가입
POST /api/v1/users/me/terms                      # 사용자 약관 동의 상태 저장
GET  /api/v1/locations/search?keyword={keyword}  # 위치 검색
PUT  /api/v1/users/me/profile                    # 사용자 프로필 업데이트 (위치/반려동물 정보)
GET  /api/v1/breeds/search?keyword={keyword}     # 견종 검색
POST /api/v1/auth/token/refresh                  # 만료된 액세스 토큰 갱신
```
#### B. 산책 기능
```
GET   /api/v1/users/me/summary-profile                                    # 대표 반려동물 이름 및 아이콘 정보 조회
GET   /api/v1/courses/recommendations?latitude={lat}&longitude={lon}...   # 우리 동네 추천 코스 요약 목록 조회
GET   /api/v1/map/areas?latitude={lat}&longitude={lon}&radius={r}         # 지도 표시 및 주변 정보 조회
GET   /api/v1/courses/{course_id}                                         # 선택된 추천 코스의 상세 정보 조회
POST  /api/v1/walk-records                                                # 산책 기록 시작
PATCH /api/v1/walk-records/{walk_record_id}/track                         # 산책 경로 및 데이터 주기적 업데이트
POST  /api/v1/marking-photos                                              # 마킹 사진 업로드
PATCH /api/v1/walk-records/{walk_record_id}/status                        # 산책 상태 일시정지/재개
PUT   /api/v1/walk-records/{walk_record_id}/end                           # 산책 기록 최종 종료 및 전체 데이터 저장
POST  /api/v1/courses                                                     # 새로운 코스 등록
GET   /api/v1/courses/{course_id}/marking-photozones                      # 산책 중인 코스 내 마킹 포토존 정보 조회
```

#### C. 조회 및 관리
```
GET  /api/v1/courses/recommendations?page={페이지번호}&size={개수}         # 추천 코스 모두보기 (페이징)
GET  /api/v1/users/me/walk-records?page={페이지번호}&size={개수}          # 사용자의 모든 산책 기록 목록 조회
PUT  /api/v1/walk-records/{walk_record_id}/score                         # 꼬리콥터 점수 저장
GET  /api/v1/courses/new/details                                         # 새로 생성할 코스의 기본 정보 조회
POST /api/v1/courses/new                                                 # 새로운 코스 정보 최종 등록
GET  /api/v1/walk-records/{walk_record_id}/summary                       # 산책 요약 정보 조회
GET  /api/v1/walk-records/{walk_record_id}/details                       # 산책 경로 및 마킹 이미지 등 상세 정보 조회
POST /api/v1/walk-records/{walk_record_id}/save                          # 산책 기록 최종 저장 확정
GET  /api/v1/users/me/profile                                            # 사용자 및 반려동물 프로필 정보 조회
GET  /api/v1/breeds                                                      # 전체 견종 목록 조회

```

## 프로젝트 구조

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


## 데이터베이스 스키마

### 주요 엔티티
- **User**: 사용자 및 반려동물 정보
- **WalkRecord**: 산책 기록 및 GPS 데이터
- **Course**: 산책 코스 정보
- **MarkingPhotozone**: 마킹 포토존
- **Location**: 위치 정보
- **Breed**: 견종 정보

자세한 ERD는 `docs/` 폴더의 관련 문서를 참조.

