// server.js (Swagger 설정 추가)

require('dotenv').config();
const { app, connectDatabase } = require('./src/app');
const logger = require('./src/config/logger');
const PORT = process.env.PORT || 5000;

// [1] Swagger 패키지 import
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path'); // 파일 경로를 다루기 위해 path 모듈 추가

console.log("✅ 실제 사용 포트:", PORT); // 이 줄 추가

// [2] Swagger 설정 객체 정의
// swagger-jsdoc이 읽을 Swagger 옵션을 정의합니다.
// 이 'apis' 경로를 확인하고, 실제 파일 경로와 일치하도록 수정해야 합니다.
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // OpenAPI 버전
    info: {
      title: 'Walking App API', // API 문서 제목
      version: '1.0.0',
      description: '산책 기록을 위한 API 문서입니다.', // API 설명
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // 서버 URL
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: []
    }],
  },
  // Swagger 주석이 있는 파일의 경로를 설정합니다.
  // 이 경로가 가장 중요합니다!
  apis: [
    // 아래 경로는 프로젝트 구조에 맞게 수정하세요.
    // server.js를 기준으로 src/routes, src/controllers 폴더를 탐색합니다.
    path.join(__dirname, 'src/routes/*.js'),
    path.join(__dirname, 'src/controllers/*.js'),
  ],
};

// [3] Swagger JSON 문서 생성
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// [4] Swagger UI 미들웨어 등록
// http://localhost:5000/api-docs 경로에 Swagger UI를 연결합니다.
// 이 라인은 다른 라우터보다 먼저 추가하는 것이 좋습니다.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// 서버 시작 함수
const startServer = async () => {
  try {
    // 데이터베이스 연결
    await connectDatabase();
    
    // 서버 시작
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      logger.info(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`📊 헬스체크: http://localhost:${PORT}/health`);
      // Swagger UI URL 추가
      logger.info(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown 처리
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} 신호를 받았습니다. 서버를 안전하게 종료합니다...`);
      
      server.close(() => {
        logger.info('HTTP 서버가 종료되었습니다.');
        
        // 데이터베이스 연결 종료
        require('./src/config/database').sequelize.close().then(() => {
          logger.info('데이터베이스 연결이 종료되었습니다.');
          process.exit(0);
        }).catch((error) => {
          logger.error('데이터베이스 연결 종료 중 오류:', error);
          process.exit(1);
        });
      });
    };

    // 시그널 핸들러 등록
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 예외 처리
    process.on('uncaughtException', (error) => {
      logger.error('처리되지 않은 예외:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('처리되지 않은 Promise 거부:', { reason, promise });
      process.exit(1);
    });

  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

// 서버 시작
startServer();
