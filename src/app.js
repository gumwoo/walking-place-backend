const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./config/logger');
const { sequelize } = require('./config/database');
const models = require('./models'); // 새로운 모델들 import
const { setupSwagger } = require('./config/swagger'); // Swagger 설정
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler'); // 에러 핸들러
require('./config/passport'); // Passport 설정

// 라우터 import (나중에 생성할 예정)
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const courseRoutes = require('./routes/courses');
// const walkRoutes = require('./routes/walks');
// const photoRoutes = require('./routes/photos');
// const markingSpotRoutes = require('./routes/markingSpots');

const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15분
  max: process.env.RATE_LIMIT_MAX || 100, // 최대 요청 수
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW || 15) * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(compression()); // 응답 압축

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 요청 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 로깅 미들웨어
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting 적용
app.use('/api/', limiter);

// Swagger API 문서화 설정
setupSwagger(app);

// API 라우트
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// API 라우트 (나중에 활성화)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/walks', walkRoutes);
// app.use('/api/photos', photoRoutes);
// app.use('/api/marking-spots', markingSpotRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '산책명소 백엔드 API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// 404 에러 핸들러
app.use('*', notFoundHandler);

// 글로벌 에러 핸들러
app.use(errorHandler);

// 데이터베이스 연결 테스트
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL 데이터베이스 연결 성공');
    
    // 개발 환경에서는 sync 실행
    if (process.env.NODE_ENV === 'development') {
      //await sequelize.sync({ force: true }); // force: true로 기존 테이블 삭제 후 재생성
      logger.info('데이터베이스 모델 동기화 완료 (기존 테이블 재생성)');
    }
  } catch (error) {
    logger.error('데이터베이스 연결 실패:', error);
    process.exit(1);
  }
};

module.exports = { app, connectDatabase };
