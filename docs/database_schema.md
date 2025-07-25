# 데이터베이스 스키마 설계 (PostgreSQL + PostGIS)

## PostGIS 확장 설치
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 최종 확정 스키마 (9개 테이블)

### 1. 사용자 (Users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- OAuth 인증 (필수)
  oauth_provider VARCHAR(20) NOT NULL, -- 'kakao', 'google'
  oauth_id VARCHAR(100) NOT NULL,
  
  -- 반려견 정보 (모두 선택사항!)
  dog_name VARCHAR(100),
  dog_breed VARCHAR(100),
  dog_birth_year INTEGER,
  dog_size VARCHAR(20), -- '소형', '중형', '대형'
  dog_image VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(oauth_provider, oauth_id)
);
```

### 2. 산책 코스 (Courses)
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id),
  
  -- 기본 정보
  thumbnail_image VARCHAR(500), -- 썸네일 이미지
  course_image VARCHAR(500), -- 코스 상세 이미지
  title VARCHAR(200) NOT NULL, -- 코스명
  distance DECIMAL(6,2), -- 거리
  level VARCHAR(20) NOT NULL CHECK (level IN ('상', '중', '하')), -- 난이도
  recommended_dog_size VARCHAR(20) CHECK (recommended_dog_size IN ('소형', '중형', '대형')), -- 추천 견종
  
  -- 꼬리점수 관련
  average_tail_score DECIMAL(3,1) DEFAULT 0, -- 평균 꼬리점수
  total_tail_score INTEGER DEFAULT 0, -- 총 꼬리점수 합계
  review_count INTEGER DEFAULT 0, -- 총 평가 횟수
  
  -- 신고 관련
  is_reported BOOLEAN DEFAULT FALSE, -- 신고 여부
  report_count INTEGER DEFAULT 0, -- 신고 횟수
  is_active BOOLEAN DEFAULT TRUE, -- 활성화 상태
  
  -- 경로
  estimated_time INTEGER, -- 예상 시간(분)
  path_geometry GEOMETRY(LINESTRING, 4326) NOT NULL, -- 경로 필수
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 코스 신고 (Course_Reports)
```sql
CREATE TABLE course_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id), -- 신고한 사용자
  course_id UUID NOT NULL REFERENCES courses(id), -- 신고 대상 코스
  report_reason TEXT NOT NULL, -- 신고 사유
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, course_id) -- 사용자당 코스별 한 번만 신고
);
```

### 4. 코스 특징 (Course_Features)
```sql
CREATE TABLE course_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 9가지 코스 특징
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. 코스 특징 매핑 (Course_Feature_Mappings)
```sql
CREATE TABLE course_feature_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  feature_id UUID NOT NULL REFERENCES course_features(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(course_id, feature_id)
);
```

### 6. 산책 기록 (Walks)
```sql
CREATE TABLE walks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID REFERENCES courses(id), -- 자유 산책 가능
  
  -- 산책 기본 정보
  walk_date DATE NOT NULL, -- 산책 날짜
  title VARCHAR(200), -- 산책 제목
  
  -- 시간 정보
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  
  -- 거리 및 통계
  total_distance DECIMAL(6,2), -- 산책거리
  total_time INTEGER, -- 총 시간(초)
  marking_count INTEGER, -- 마킹횟수
  tail_score INTEGER, -- 꼬리점수
  
  -- 경로
  walk_path GEOMETRY(LINESTRING, 4326), -- 실제 걸은 경로
  
  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'cancelled')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. 산책 사진 (Walk_Photos)
```sql
CREATE TABLE walk_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  walk_id UUID NOT NULL REFERENCES walks(id),
  image_url VARCHAR(500) NOT NULL,
  photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('route', 'marking')), -- 경로 이미지 vs 마킹 이미지
  image_order INTEGER, -- 이미지 순서
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. 마킹포토존 (Marking_Photozones)
```sql
CREATE TABLE marking_photozones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  name VARCHAR(200) NOT NULL,
  location GEOMETRY(POINT, 4326) NOT NULL,
  detection_radius INTEGER NOT NULL DEFAULT 100, -- 감지 반경(미터)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. 포토존 사진 (Photozone_Photos)
```sql
CREATE TABLE photozone_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marking_photozone_id UUID NOT NULL REFERENCES marking_photozones(id),
  user_id UUID NOT NULL REFERENCES users(id),
  walk_id UUID NOT NULL REFERENCES walks(id),
  file_url VARCHAR(500) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 인덱스 설정
```sql
-- PostGIS 공간 인덱스
CREATE INDEX idx_courses_path_geometry ON courses USING GIST(path_geometry);
CREATE INDEX idx_walks_walk_path ON walks USING GIST(walk_path);
CREATE INDEX idx_marking_photozones_location ON marking_photozones USING GIST(location);

-- 일반 인덱스
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_courses_creator ON courses(creator_id);
CREATE INDEX idx_courses_tail_score ON courses(average_tail_score DESC);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_active_score ON courses(is_active, average_tail_score DESC);
CREATE INDEX idx_course_reports_course ON course_reports(course_id);
CREATE INDEX idx_course_feature_mappings_course ON course_feature_mappings(course_id);
CREATE INDEX idx_walks_user ON walks(user_id);
CREATE INDEX idx_walks_course ON walks(course_id);
CREATE INDEX idx_walks_status ON walks(status);
CREATE INDEX idx_walks_user_status ON walks(user_id, status);
CREATE INDEX idx_walk_photos_walk ON walk_photos(walk_id);
CREATE INDEX idx_photozone_photos_zone ON photozone_photos(marking_photozone_id);
CREATE INDEX idx_photozone_photos_user ON photozone_photos(user_id);
CREATE INDEX idx_photozone_photos_walk ON photozone_photos(walk_id);
```

## 테이블 관계 요약
1. **users** ← courses (creator_id)
2. **users** ← course_reports (user_id)
3. **courses** ← course_reports (course_id)
4. **courses** ↔ course_features (N:M via course_feature_mappings)
5. **users** ← walks (user_id)
6. **courses** ← walks (course_id)
7. **walks** ← walk_photos (walk_id)
8. **courses** ← marking_photozones (course_id)
9. **marking_photozones** ← photozone_photos (marking_photozone_id)
10. **users** ← photozone_photos (user_id)
11. **walks** ← photozone_photos (walk_id)

**총 9개 테이블로 산책명소 앱의 모든 기능을 지원합니다.**
