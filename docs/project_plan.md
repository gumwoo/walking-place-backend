# 산책명소 백엔드 프로젝트 계획서

## 프로젝트 개요
- **프로젝트명**: 산책명소 (Walking Places)
- **목적**: 반려견 산책 코스 추천 및 공유 플랫폼
- **개발자**: 백엔드 개발자
- **시작일**: 2025-07-03

## PM 요청 주요 기능
1. **GPS 좌표 기반 경로 매칭 알고리즘 개발**
2. **꼬리점수 높은 순 코스 정렬 API 개발**
3. **걷기 궤적 좌표 저장 API 개발**
4. **포토존 데이터 저장 API 개발**
5. **포토존 내 사진/강아지 정보 조회 API 개발**
6. **일지 데이터 조회 API 개발**
7. **코스 데이터 재사용 API 개발**
8. **20m 이탈 감지 로직 개발**
9. **점수 저장 API 개발**
10. **프로필 데이터 저장 API 개발**
11. **카카오/구글 OAuth 연동 API 개발**
12. **약관 버전 관리 시스템 개발**
13. **타 유저 프로필 조회 API 개발**

## 추가 필요 기능
- 실시간 위치 추적 API
- 코스 검색/필터링 API
- 사진 업로드/관리 API
- 알림 시스템 API
- 통계/분석 API
- 즐겨찾기 API
- 리뷰/평점 API
- 날씨 연동 API

## 기술 스택
- **Database**: PostgreSQL + PostGIS
- **Backend**: Node.js + Express.js
- **ORM**: Sequelize
- **Authentication**: JWT + OAuth (카카오, 구글)

## 완료된 작업
- [x] 프로젝트 계획서 작성
- [x] 기본 폴더 구조 생성
- [x] API 설계 문서 작성
- [x] PostgreSQL + PostGIS 기반 데이터베이스 스키마 설계
- [x] 프로젝트 구조 문서 작성
- [x] package.json 설정 및 의존성 설치
- [x] 환경변수 설정 (.env)
- [x] 기본 Express 애플리케이션 구조 생성
- [x] 로거 설정 (Winston)
- [x] 데이터베이스 설정 파일
- [x] 서버 진입점 파일
- [x] PostgreSQL + PostGIS 데이터베이스 생성
- [x] 앱 디자인 기반 데이터베이스 스키마 전면 수정 (최종 9개 테이블)
  - Users 테이블: OAuth 기반 인증 + 반려견 정보 (선택)
  - Courses 테이블: 이미지, 꼬리점수, 신고 기능 포함
  - CourseReports 테이블: 신고 시스템
  - CourseFeatures 테이블: 9가지 코스 특징
  - CourseFeatureMappings 테이블: 코스-특징 N:M 관계
  - Walks 테이블: 산책 기록, 꼬리점수 포함
  - WalkPhotos 테이블: 경로/마킹 이미지 구분
  - MarkingPhotozones 테이블: 마킹포토존 관리
  - PhotozonePhotos 테이블: 포토존 사진 저장
- [x] 기존 Sequelize 모델 완전 삭제 및 새로운 9개 모델 생성
- [x] 모든 모델 간 관계 설정 완료 (Foreign Key, Many-to-Many)
- [x] ENUM 타입 기본값 문제 해결 및 데이터베이스 동기화 성공
- [x] 서버 실행 및 9개 테이블 생성 테스트 성공

## 해야할 일
- [x] 최종 데이터베이스 스키마 설계 및 구현 완료 (9개 테이블)
- [x] 모든 Sequelize 모델 생성 및 관계 설정 완료
- [x] 데이터베이스 동기화 및 서버 실행 테스트 성공
- [x] **GitHub 저장소 인프라 구축 및 첫 커밋 완료**
  - [x] GitHub 저장소 생성 (https://github.com/gumwoo/walking-place-backend.git)
  - [x] Git 초기화 및 원격 저장소 연결
  - [x] 첫 커밋 및 main 브랜치 푸시 완료
  - [x] GitHub Flow 브랜치 전략 준비 완료
  - [x] GitHub 이슈/PR 템플릿 생성 (버그, 기능요청, 질문)
  - [x] 기본 응답 통일 코드 (ApiResponse 유틸리티)
  - [x] 공통 예외 처리 코드 (ErrorHandler 미들웨어)
  - [x] Swagger API 문서화 설정
  - [x] Passport.js 인증 시스템 설정 (JWT, OAuth)
  - [x] 인증 미들웨어 구현
  - [x] MVC 폴더 구조 생성 (controllers, services, routes, validations)
  - [x] .gitignore 및 README.md 작성
  - [x] 기본 API 라우트 구조 생성
- [ ] 인증 시스템 구현 (카카오/구글 OAuth)
- [ ] 사용자 관리 API 구현
- [ ] 코스 관리 API 구현 (생성, 조회, 수정, 삭제, 신고)
- [ ] 산책 기록 API 구현 (시작, 진행, 완료, 꼬리점수)
- [ ] 마킹포토존 API 구현
- [ ] 포토존 사진 업로드 API 구현
- [ ] 코스 특징 관리 API 구현
- [ ] 꼬리점수 시스템 API 구현
- [ ] GPS 경로 매칭 알고리즘 구현
- [ ] 20m 이탈 감지 로직 구현
- [ ] 파일 업로드 시스템 구현
- [ ] API 테스트 작성
- [ ] API 문서화 (Swagger)
