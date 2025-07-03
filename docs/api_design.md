# API 설계 문서

## Base URL
```
http://localhost:5000/api
```

## 인증 관련 API

### 1. 카카오 로그인
- **POST** `/auth/kakao`
- **설명**: 카카오 OAuth 로그인
- **Request Body**:
  ```json
  {
    "accessToken": "kakao_access_token"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자명"
    }
  }
  ```

### 2. 로그아웃
- **POST** `/auth/logout`
- **Headers**: `Authorization: Bearer {token}`

## 사용자 관리 API

### 1. 사용자 프로필 조회
- **GET** `/users/profile`
- **Headers**: `Authorization: Bearer {token}`

### 2. 사용자 프로필 수정
- **PUT** `/users/profile`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "사용자명",
    "homeLocation": {
      "latitude": 37.5665,
      "longitude": 126.9780,
      "address": "서울시 중구"
    }
  }
  ```

### 3. 위치 설정
- **PUT** `/users/location`
- **Request Body**:
  ```json
  {
    "latitude": 37.5665,
    "longitude": 126.9780
  }
  ```

## 코스 관리 API

### 1. 근처 코스 조회
- **GET** `/courses/nearby`
- **Query Parameters**:
  - `lat`: 위도
  - `lng`: 경도
  - `radius`: 반경(km)
  - `page`: 페이지 번호
  - `limit`: 페이지당 항목 수

### 2. 코스 상세 조회
- **GET** `/courses/:courseId`

### 3. 코스 생성
- **POST** `/courses`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "코스명",
    "description": "코스 설명",
    "difficulty": "easy|medium|hard",
    "estimatedTime": 30,
    "distance": 2.5,
    "path": [
      {
        "latitude": 37.5665,
        "longitude": 126.9780,
        "order": 1
      }
    ],
    "tags": ["공원", "강변"]
  }
  ```

### 4. 내가 만든 코스 조회
- **GET** `/courses/my`
- **Headers**: `Authorization: Bearer {token}`

## 산책 기록 API

### 1. 산책 시작
- **POST** `/walks/start`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "courseId": "course_id"
  }
  ```

### 2. 산책 기록 업데이트
- **PUT** `/walks/:walkId/update`
- **Request Body**:
  ```json
  {
    "currentLocation": {
      "latitude": 37.5665,
      "longitude": 126.9780
    },
    "timestamp": "2025-07-03T10:00:00Z"
  }
  ```

### 3. 산책 완료
- **POST** `/walks/:walkId/complete`
- **Request Body**:
  ```json
  {
    "totalDistance": 2.5,
    "totalTime": 1800,
    "photos": ["photo_url1", "photo_url2"]
  }
  ```

### 4. 산책 기록 조회
- **GET** `/walks/history`
- **Headers**: `Authorization: Bearer {token}`

## 마킹포토존 API

### 1. 근처 마킹포토존 조회
- **GET** `/marking-spots/nearby`
- **Query Parameters**:
  - `lat`: 위도
  - `lng`: 경도
  - `radius`: 반경(km)

### 2. 마킹포토존 생성
- **POST** `/marking-spots`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "포토존명",
    "description": "포토존 설명",
    "location": {
      "latitude": 37.5665,
      "longitude": 126.9780
    }
  }
  ```

## 파일 업로드 API

### 1. 사진 업로드
- **POST** `/upload/photo`
- **Headers**: `Authorization: Bearer {token}`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `photo`: 이미지 파일
  - `walkId`: 산책 ID (선택)
  - `markingSpotId`: 마킹포토존 ID (선택)
