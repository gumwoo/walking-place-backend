# Walking Backend 프로젝트 배포 계획

## 현재 상황
- 로컬 개발 환경에서 개발 완료된 상태
- EC2 서버(3.37.4.158)에 VS Code SSH 연결 및 git clone 완료
- 도커를 이용한 배포 예정

## 완료된 작업
- [x] 로컬 개발 환경 구축
- [x] 기본 API 구현
- [x] EC2 서버 연결 및 소스코드 복사

## 진행해야 할 작업
- [ ] 환경설정 파일 서버용으로 수정
- [ ] Dockerfile 및 docker-compose.yml 작성
- [ ] 도메인 설정 및 HTTPS 적용
- [ ] 서버 배포 및 테스트

## 배포 대상
- EC2 서버: 3.37.4.158
- OS: Ubuntu
- 배포 방식: Docker
- 목표: HTTPS 도메인으로 프론트엔드에 제공
