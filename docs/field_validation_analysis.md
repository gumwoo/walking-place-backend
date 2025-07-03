# Sequelize 모델 필수/선택 필드 구분 현황

## ✅ 올바르게 구분되어 있습니다!

### 🔍 검증 결과
모든 Sequelize 모델에서 `allowNull` 옵션을 통해 필수/선택 필드가 명확히 구분되어 있습니다.

## 📋 주요 테이블별 필수/선택 필드 분석

### 👤 Users 테이블
**필수 필드 (allowNull: false):**
- `id` (기본키)
- `totalScore` (기본값: 0)
- `isActive` (기본값: true)
- `created_at`, `updated_at` (타임스탬프)

**선택 필드 (allowNull: true):**
- `kakaoId`, `googleId` (OAuth ID는 선택적)
- `email`, `name`, `nickname` (프로필 정보)
- `homeLocation`, `homeAddress` (위치 정보)
- `dogName`, `dogBreed`, `dogAge`, `dogImage` (반려견 정보)
- `profileImage`, `privacySettings` (부가 정보)

**👍 설계 의도가 정확함:**
- OAuth ID는 둘 중 하나만 있으면 되므로 선택적
- 개인정보는 사용자가 입력하지 않을 수 있으므로 선택적
- 반려견 정보는 나중에 추가 가능하므로 선택적

### 🗺️ Courses 테이블
**필수 필드 (allowNull: false):**
- `id` (기본키)
- `creatorId` (코스 생성자 - 반드시 필요)
- `name` (코스명 - 반드시 필요)
- `difficulty` (난이도 - 기본값: 'easy')
- 각종 카운터 필드들 (기본값 0)

**선택 필드 (allowNull: true):**
- `description` (설명 - 선택적)
- `estimatedTime`, `distance` (예상시간, 거리 - 계산 가능)
- `startLocation`, `startAddress` (위치 정보 - GPS 없을 수도)
- `pathGeometry`, `elevationData` (경로 데이터 - 나중 생성)
- `tags` (태그 - 선택적)

**👍 설계 의도가 정확함:**
- 필수 정보만 있으면 코스 생성 가능
- 상세 정보는 나중에 업데이트 가능

### 🚶‍♂️ Walks 테이블
**필수 필드 (allowNull: false):**
- `id` (기본키)
- `userId` (산책한 사용자 - 반드시 필요)
- 기본값이 있는 필드들 (deviationCount, completionRate 등)
- `status` (산책 상태 - 기본값: 'started')

**선택 필드 (allowNull: true):**
- `courseId` (자유 산책일 수도 있음)
- `startTime`, `endTime` (시작/종료 시간)
- `totalDistance`, `totalTime` (완료 시 계산)
- `walkPath` (GPS 경로 데이터)
- `weatherData` (날씨 정보)

**👍 설계 의도가 정확함:**
- 산책 시작 시점에는 최소 정보만 필요
- 완료 시점에 통계 데이터 업데이트

### 📸 Photos 테이블
**필수 필드 (allowNull: false):**
- `id` (기본키)
- `userId` (사진 업로드한 사용자 - 반드시 필요)
- `fileUrl` (파일 경로 - 반드시 필요)
- 기본값이 있는 필드들

**선택 필드 (allowNull: true):**
- `walkId`, `markingSpotId` (연결된 산책/포토존 - 선택적)
- `location`, `takenAt` (GPS/시간 메타데이터)
- `dogInfo`, `tags` (부가 정보)

**👍 설계 의도가 정확함:**
- 사진 파일만 있으면 업로드 가능
- 메타데이터는 선택적으로 추가

## 🎯 설계 원칙 준수 확인

### ✅ 올바른 설계 패턴
1. **점진적 데이터 입력**: 최소 정보로 시작해서 점차 추가
2. **유연한 사용 시나리오**: 다양한 사용 패턴 지원
3. **데이터 무결성**: 핵심 관계는 필수, 부가 정보는 선택적
4. **사용자 경험**: 강제 입력 최소화

### ✅ 비즈니스 로직 반영
- **OAuth 로그인**: 카카오/구글 중 하나만 있으면 됨
- **반려견 정보**: 나중에 추가 가능
- **위치 정보**: GPS 권한 없을 수도 있음
- **산책 데이터**: 시작 시점과 완료 시점 구분

## 🚀 결론
**모든 Sequelize 모델이 비즈니스 요구사항에 맞게 필수/선택 필드가 정확히 구분되어 설계되었습니다!**

- 사용자 가입 시 최소 정보만 요구
- 점진적 프로필 완성 가능
- 다양한 사용 시나리오 지원
- 데이터 무결성 보장
