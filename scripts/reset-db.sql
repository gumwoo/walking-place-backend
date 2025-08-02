-- 데이터베이스 초기화 및 재생성
DROP DATABASE IF EXISTS walking_places;
CREATE DATABASE walking_places;

-- PostGIS 확장 설치
\c walking_places;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 확장 설치 확인
SELECT name, default_version, installed_version FROM pg_available_extensions 
WHERE name IN ('postgis', 'uuid-ossp');
