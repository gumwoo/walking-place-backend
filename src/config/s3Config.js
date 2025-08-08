const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('./logger');

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 설정 상수
const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
  baseUrl: process.env.AWS_S3_BASE_URL,
  presignedUrlExpiration: 300, // 5분
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  uploadPaths: {
    profile: 'profiles/',
    marking: 'markings/',
    course_cover: 'courses/covers/',
  }
};

// S3 클라이언트와 설정 유효성 검증
const validateS3Config = () => {
  const requiredEnvVars = ['AWS_REGION', 'AWS_S3_BUCKET_NAME', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  logger.info('S3 configuration validated successfully');
};

module.exports = {
  s3Client,
  S3_CONFIG,
  validateS3Config
};