require('dotenv').config();
const { app, connectDatabase } = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

console.log("✅ 실제 사용 포트:", PORT); // 이 줄 추가

// 서버 시작 함수
const startServer = async () => {
  try {
    // 데이터베이스 연결
    await connectDatabase();
    
    // 서버 시작
    const server = app.listen(PORT, () => {
      logger.info(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      logger.info(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`📊 헬스체크: http://localhost:${PORT}/health`);
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
