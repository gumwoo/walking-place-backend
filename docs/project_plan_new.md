# 🐕 산책명소 백엔드 프로젝트 계획

## 🚀 **최근 완료 작업**

### ✅ **카카오 로그인 API 구현 완료** (2025-08-01)
- POST /api/v1/auth/kakao - 카카오 로그인/회원가입 ✅
- GET /api/v1/auth/kakao/callback - 카카오 OAuth 콜백 ✅  
- POST /api/v1/auth/token/refresh - 액세스 토큰 갱신 ✅
- POST /api/v1/auth/logout - 로그아웃 ✅

### ✅ **온보딩 관련 API 구현 완료** (2025-08-01)
- POST /api/v1/users/me/terms - 사용자 약관 동의 상태 저장 ✅
- GET /api/v1/locations/search?keyword={keyword} - 위치 검색 ✅
- PUT /api/v1/users/me/profile - 사용자 프로필 업데이트 ✅
- GET /api/v1/breeds/search?keyword={keyword} - 견종 검색 ✅
- GET /api/v1/users/me/profile - 사용자 프로필 조회 ✅
- GET /api/v1/users/me/summary-profile - 사용자 요약 프로필 조회 ✅

### ✅ **데이터베이스 모델 추가** (2025-08-01)
- Location 모델 - 위치 정보 관리 ✅
- Breed 모델 - 견종 정보 관리 (크롤링 데이터 사용) ✅
- Term 모델 - 약관 관리 ✅
- UserTermAgreement 모델 - 사용자 약관 동의 기록 ✅
- User 모델에 preferred_location_id 필드 추가 ✅

### ✅ **서비스 및 컨트롤러 구현** (2025-08-01)
- OnboardingService - 온보딩 관련 비즈니스 로직 ✅
- OnboardingController - 온보딩 관련 API 컨트롤러 ✅
- 라우터 추가: users, locations, breeds ✅

### ✅ **데이터 초기화 스크립트** (2025-08-01)
- 크롤링된 151개 견종 데이터 활용 ✅
- 필수 약관 4개 (서비스 이용약관, 개인정보 처리방침 등) ✅
- 위치 데이터는 사용자 검색 시 동적 생성 ✅

---

## 🎯 **다음 해야 할 작업**

### 🔄 **메인 화면 및 산책 관련 API**
- GET /api/v1/courses/recommendations - 우리 동네 추천 코스 목록 조회
- GET /api/v1/map/areas - 지도 표시 및 주변 정보 조회
- GET /api/v1/courses/{course_id} - 선택된 추천 코스 상세 정보 조회

### 🚶 **산책 기록 관련 API**
- POST /api/v1/walk-records - 산책 기록 시작
- PATCH /api/v1/walk-records/{id}/track - 산책 경로 및 데이터 주기적 업데이트
- PUT /api/v1/walk-records/{id}/end - 산책 기록 최종 종료
- POST /api/v1/courses - 새로운 코스 등록

---

## ⚙️ **개발 환경 설정**

### 📚 **설치된 주요 패키지**
- Express.js - 웹 프레임워크
- Sequelize - ORM (PostgreSQL)
- JWT - 인증 토큰 관리
- Winston - 로깅
- Axios - HTTP 클라이언트
- bcrypt - 비밀번호 암호화

### 🗄️ **데이터베이스 구조**
- PostgreSQL 사용
- 총 14개 모델 (User, Location, Breed, Term, UserTermAgreement 등)
- JWT 기반 인증 시스템

### 🔧 **실행 명령어**
```bash
npm run dev          # 개발 서버 실행 (http://localhost:5000)
node scripts/seedData.js  # 필수 데이터 초기화
```

---

## 📋 **API 테스트 가이드**

### 🧪 **온보딩 API 테스트 순서**
1. **카카오 로그인**: POST /api/v1/auth/kakao
2. **약관 동의**: POST /api/v1/users/me/terms  
3. **위치 검색**: GET /api/v1/locations/search?keyword=강남
4. **견종 검색**: GET /api/v1/breeds/search?keyword=골든
5. **프로필 업데이트**: PUT /api/v1/users/me/profile

### 🔐 **인증**
- 모든 사용자 관련 API는 JWT 토큰 필요
- Header: `Authorization: Bearer {token}`

---

## 📄 **중요 파일 위치**

### 🎯 **핵심 구현 파일**
- `src/controllers/authController.js` - 카카오 로그인 로직
- `src/controllers/onboardingController.js` - 온보딩 관련 API
- `src/services/authService.js` - 인증 서비스 로직
- `src/services/onboardingService.js` - 온보딩 서비스 로직
- `src/models/` - 데이터베이스 모델들

### 📊 **데이터 파일**
- `src/dog-breed-crawler/korean_dog_breeds.json` - 크롤링된 견종 데이터
- `scripts/seedData.js` - 데이터 초기화 스크립트
