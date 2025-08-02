# 산책명소 백엔드 프로젝트 계획서

## 📋 프로젝트 개요
- **프로젝트명**: Walking Backend (산책명소 백엔드)
- **목적**: 반려동물 산책 코스 공유 및 관리 백엔드 API 서버
- **기술스택**: Node.js, Express, PostgreSQL, PostGIS, Sequelize

## ✅ 완료된 작업 (Completed Tasks)

### 🏗️ **기본 설정 및 구조**
- [x] Express 서버 기본 설정
- [x] PostgreSQL 데이터베이스 연결 설정
- [x] Sequelize ORM 설정
- [x] 로깅 시스템 (Winston) 구축
- [x] 미들웨어 설정 (CORS, JSON Parser, 로깅)
- [x] 라우터 구조 설정

### 🗄️ **데이터베이스 & 모델**
- [x] ERD 기반 모델 구조 설계
- [x] User 모델 구현 (사용자 + 반려동물 정보 통합)
- [x] Location 모델 구현 (위치 정보)
- [x] Breed 모델 구현 (견종 정보)
- [x] Course 모델 구현 (산책 코스)
- [x] WalkRecord 모델 구현 (산책 기록)
- [x] MarkingPhoto 모델 구현 (마킹 사진)
- [x] MarkingPhotozone 모델 구현 (마킹 포토존)
- [x] CourseFeature 모델 구현 (코스 특징)
- [x] Term 모델 구현 (약관)
- [x] PostgreSQL Type 충돌 해결 (force: true)
- [x] PostGIS 확장 설치 스크립트

### 🎯 **API 컨트롤러 & 서비스**
- [x] **AuthController** - 카카오 로그인, 토큰 관리
- [x] **UserController** - 사용자 프로필 관리
- [x] **LocationController** - 위치 검색 및 조회
- [x] **LocationService** - 위치 검색 로직 (PostGIS 활용)
- [x] **BreedController** - 견종 검색 및 관리
- [x] **BreedService** - 견종 검색, 인기도 기반 정렬
- [x] **CourseController** - 코스 관리 및 추천
- [x] **WalkRecordController** - 산책 기록 CRUD
- [x] **MarkingPhotoController** - 마킹 사진 관리
- [x] **MapController** - 지도 주변 정보 조회
- [x] **MapService** - 지도 통합 서비스 로직

### 🔧 **오류 해결**
- [x] `Cannot find module '../controllers/locationController'` 해결
- [x] `Route.get() requires a callback function` (breeds.js) 해결
- [x] `Route.post() requires a callback function` (walkRecords.js) 해결
- [x] PostgreSQL Type 충돌 및 PostGIS 관련 오류 해결
- [x] 라우터-컨트롤러 함수명 매핑 완료

## 🚧 진행 중인 작업 (In Progress)

### 🔄 **현재 상태**
- 모든 기본 컨트롤러와 서비스 구현 완료
- 라우터 매핑 문제 해결 완료
- 데이터베이스 모델 ERD 기준 완벽 구현

## 📝 해야 할 작업 (TODO)

### 🧪 **테스트 & 검증**
- [ ] API 엔드포인트 동작 테스트
- [ ] 데이터베이스 연결 및 모델 동작 확인
- [ ] 실제 데이터로 기능 검증

### 🔐 **보안 & 인증**
- [ ] JWT 토큰 검증 미들웨어 테스트
- [ ] 카카오 OAuth 연동 테스트
- [ ] 권한 기반 접근 제어 검증

### 📊 **데이터 & 성능**
- [ ] 초기 더미 데이터 생성 (견종, 위치 등)
- [ ] PostGIS 지리적 쿼리 성능 최적화
- [ ] 데이터베이스 인덱스 최적화

### 🎯 **기능 완성도**
- [ ] 파일 업로드 (프로필 이미지, 마킹 사진) 구현
- [ ] 실시간 산책 경로 추적 로직 완성
- [ ] 꼬리콥터 점수 계산 알고리즘 구현
- [ ] 코스 추천 알고리즘 고도화

## 📈 **API 엔드포인트 현황**

### ✅ **구현 완료된 API**
```
POST   /api/v1/auth/kakao                    # 카카오 로그인
POST   /api/v1/users/me/terms               # 약관 동의
GET    /api/v1/locations/search             # 위치 검색
PUT    /api/v1/users/me/profile             # 프로필 업데이트
GET    /api/v1/breeds/search                # 견종 검색  
GET    /api/v1/breeds                       # 전체 견종 목록
GET    /api/v1/map/areas                    # 지도 주변 정보
POST   /api/v1/walk-records                 # 산책 시작
PATCH  /api/v1/walk-records/:id/track       # 산책 경로 업데이트
PUT    /api/v1/walk-records/:id/end         # 산책 종료
```

## 🎯 **다음 단계 우선순위**

### 1️⃣ **즉시 실행** (High Priority)
1. **서버 실행 테스트** - 모든 오류 해결 후 정상 작동 확인
2. **기본 API 테스트** - Postman으로 주요 엔드포인트 검증
3. **데이터베이스 초기화** - reset-db.sql 실행

### 2️⃣ **단기 목표** (Medium Priority)  
1. **더미 데이터 생성** - 견종, 위치, 코스 기본 데이터
2. **파일 업로드 구현** - 이미지 업로드 로직
3. **실시간 기능 테스트** - 산책 경로 추적 검증

### 3️⃣ **장기 목표** (Low Priority)
1. **성능 최적화** - PostGIS 쿼리 최적화
2. **고급 기능** - 추천 알고리즘, 꼬리콥터 점수
3. **모니터링** - 로그 분석, 성능 모니터링

## 🔍 **현재 이슈 & 해결 상태**

### ✅ **해결 완료**
- PostgreSQL Type 충돌 → force: true로 해결
- 컨트롤러 모듈 누락 → 모든 컨트롤러 구현 완료
- 라우터 함수명 불일치 → 매핑 함수로 해결
- PostGIS 확장 누락 → reset-db.sql 스크립트로 해결

### 🎯 **현재 상태**
**✅ 모든 기본 오류 해결 완료 - 서버 실행 준비 완료!**

---

## 📚 **참고 문서**
- ERD: 프로젝트 루트의 ERD 다이어그램 참조
- API 스펙: 제공된 API 명세서 기준 구현
- 모델 관계: User-Breed(N:1), User-Location(N:1), Course-WalkRecord(1:N) 등

**Last Updated**: 2025-08-02
**Status**: 🟢 Ready for Testing
