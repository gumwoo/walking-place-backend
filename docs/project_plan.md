# 산책명소 프로젝트 계획서

## 📋 프로젝트 개요
**프로젝트명**: 산책명소 - 반려동물 산책 코스 추천 및 공유 플랫폼  
**타입**: 백엔드 API 서버  
**기술스택**: Node.js + Express + PostgreSQL + Sequelize  
**포트**: 5000  

## 🎯 주요 기능
1. **카카오 소셜 로그인** 기반 사용자 인증
2. **GPS 기반 실시간 산책 추적** 및 경로 기록
3. **마킹 포토존** 시스템으로 사진 촬영 및 공유
4. **꼬리콥터 게임** 점수 시스템
5. **코스 추천 및 생성** 기능
6. **반려동물 프로필** 관리

## 📊 데이터베이스 구조 (ERD 기반)

### 주요 엔티티 (9개)
1. **User** - 사용자 및 반려동물 정보 통합
2. **Location** - 위치 정보 (동네, 주소)
3. **Breed** - 견종 정보
4. **WalkRecord** - 산책 기록 (GPS 경로, 상태 관리)
5. **MarkingPhotozone** - 마킹 포토존
6. **MarkingPhoto** - 마킹 사진
7. **Course** - 산책 코스
8. **CourseFeature** - 코스 특징 (물가, 흙길 등)
9. **Term** - 이용약관

### 중간 테이블 (4개)
- UserTermAgreement (사용자-약관 동의)
- CourseCourseFeature (코스-특징)
- CourseLocationAssociation (코스-위치)
- WalkRecordMarkingPhotozone (산책기록-포토존)

## 🔄 사용자 플로우

### A. 온보딩 플로우
```
시작 → 카카오 로그인 → 약관 동의 → 위치 설정 → 프로필 설정 → 홈 메인
```

### B. 산책 플로우
```
홈 메인 → 코스 선택(새 코스/기존 코스) → 카운트다운 → 산책 시작
→ GPS 추적 + 마킹 → 산책 완료 → 꼬리콥터 점수 → 코스 등록 여부 → 홈 복귀
```

## 🔗 API 엔드포인트 구조

### A. 인증 및 온보딩
- `POST /api/v1/auth/kakao` - 카카오 로그인
- `POST /api/v1/users/me/terms` - 약관 동의
- `GET /api/v1/locations/search` - 위치 검색
- `PUT /api/v1/users/me/profile` - 프로필 업데이트
- `GET /api/v1/breeds/search` - 견종 검색

### B. 산책 기능
- `GET /api/v1/users/me/summary-profile` - 프로필 요약
- `GET /api/v1/courses/recommendations` - 추천 코스
- `POST /api/v1/walk-records` - 산책 시작
- `PATCH /api/v1/walk-records/{id}/track` - 경로 업데이트
- `PUT /api/v1/walk-records/{id}/end` - 산책 종료
- `POST /api/v1/courses` - 새 코스 등록

### C. 조회 및 관리
- `GET /api/v1/users/me/walk-records` - 산책 기록 목록
- `PUT /api/v1/walk-records/{id}/score` - 꼬리콥터 점수
- `POST /api/v1/marking-photos` - 마킹 사진 업로드

## ✅ 완료된 작업
- [x] 프로젝트 초기 설정 (Express 서버, PostgreSQL, Sequelize)
- [x] 기본 패키지 의존성 설치 (JWT, 카카오 OAuth, 이미지 처리 등)
- [x] 로깅 시스템 구축 (Winston)

- [x] 견종 크롤러 구현 및 데이터 수집
- [x] 포토존 관련 기본 구조 구현 (controller, service, middleware)
- [x] 이미지 업로드 서비스 구현
- [x] 프로젝트 문서화 (README, project_plan)
- [x] 제공된 6개 파일 스펙 완전 분석 및 이해

## 🚧 진행 중인 작업 (우선순위 높음)
- [ ] **제공된 6개 파일 스펙에 맞춰 전면 리팩토링**
  - [ ] ERD 기반 9개 엔티티 모델 재구성 (User, Location, Breed, WalkRecord, MarkingPhotozone, MarkingPhoto, Course, CourseFeature, Term)
  - [ ] API 엔드포인트 스펙 완전 재설계 (PDF 3번 문서 기준)
  - [ ] 플로우차트에 따른 사용자 경험 구현
- [ ] **카카오 소셜 로그인 완전 구현**
  - [ ] OAuth 2.0 연동 및 JWT 토큰 시스템
  - [ ] 온보딩 플로우 (약관동의→위치설정→프로필설정)
- [ ] **GPS 기반 실시간 산책 추적 시스템**
  - [ ] pathCoordinates(JSONB) 실시간 업데이트
  - [ ] 산책 상태 관리 (STARTED, PAUSED, COMPLETED, CANCELED, ABANDONED)


## 📝 해야 할 작업 (제공된 스펙 기준)
1. **데이터베이스 모델 재설계**
   - 제공된 ERD에 맞춰 9개 엔티티 모델 생성
   - 관계 설정 및 중간 테이블 구현

2. **인증 시스템 구현**
   - 카카오 OAuth 2.0 연동
   - JWT 토큰 발급/검증 미들웨어

3. **산책 추적 시스템**
   - GPS 좌표 실시간 저장 (pathCoordinates)
   - 산책 상태 관리 (STARTED, PAUSED, COMPLETED, CANCELED, ABANDONED)

4. **마킹 포토존 시스템**
   - 이미지 업로드 및 저장
   - 포토존 생성 및 관리

5. **꼬리콥터 점수 시스템**
   - 점수 계산 로직
   - 코스별 평균 점수 관리

6. **코스 추천 시스템**
   - 위치 기반 코스 추천
   - 반려동물 크기별 필터링

## 🗂️ 프로젝트 구조
```
C:\walking-backend/
├── docs/                 # 문서
├── logs/                 # 로그 파일
├── src/
│   ├── app.js            # Express 앱 설정
│   ├── config/           # 설정 파일
│   ├── controllers/      # 컨트롤러
│   ├── models/           # Sequelize 모델
│   ├── routes/           # 라우터
│   ├── services/         # 비즈니스 로직
│   ├── middlewares/      # 미들웨어
│   └── utils/            # 유틸리티
├── tests/                # 테스트
├── uploads/              # 업로드 파일
├── server.js             # 서버 엔트리 포인트
└── package.json
```

## 🔧 개발 환경 설정
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start

# 테스트 실행
npm test

# 데이터베이스 마이그레이션
npm run db:migrate

# 견종 데이터 크롤링
npm run crawl:breeds
```

---
**최종 업데이트**: 2025-07-28  
**담당자**: 백엔드 개발팀
