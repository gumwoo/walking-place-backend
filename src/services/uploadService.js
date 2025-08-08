const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../config/logger');
const { s3Client, S3_CONFIG } = require('../config/s3Config');

class UploadService {
  
  /**
   * S3 Presigned URL 생성
   * @param {Object} params - 업로드 파라미터
   * @param {string} params.fileName - 원본 파일명
   * @param {string} params.fileType - 파일 MIME 타입
   * @param {string} params.uploadType - 업로드 타입 (profile, marking, course_cover)
   * @returns {Object} Presigned URL과 파일 정보
   */
  async generatePresignedUrl({ fileName, fileType, uploadType }) {
    try {
      logger.info('Presigned URL 생성 시작', { fileName, fileType, uploadType });

      // 1. 업로드 타입 유효성 검증
      if (!S3_CONFIG.uploadPaths[uploadType]) {
        throw new Error(`지원되지 않는 업로드 타입입니다: ${uploadType}`);
      }

      // 2. 파일 타입 유효성 검증
      if (!S3_CONFIG.allowedFileTypes.includes(fileType)) {
        throw new Error(`지원되지 않는 파일 타입입니다: ${fileType}`);
      }

      // 3. 고유한 파일명 생성
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${Date.now()}-${uuidv4()}${fileExtension}`;
      const s3Key = `${S3_CONFIG.uploadPaths[uploadType]}${uniqueFileName}`;

      // 4. S3 PutObject 명령 생성
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: s3Key,
        ContentType: fileType,
        // 추가 메타데이터
        Metadata: {
          'original-name': fileName,
          'upload-type': uploadType,
          'uploaded-at': new Date().toISOString()
        }
      });

      // 5. Presigned URL 생성
      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: S3_CONFIG.presignedUrlExpiration,
      });

      // 6. 최종 파일 URL 생성
      const fileUrl = `${S3_CONFIG.baseUrl}/${s3Key}`;

      const result = {
        uploadUrl,
        fileUrl,
        fileName: uniqueFileName,
        s3Key,
        expiresIn: S3_CONFIG.presignedUrlExpiration
      };

      logger.info('Presigned URL 생성 완료', { s3Key, expiresIn: S3_CONFIG.presignedUrlExpiration });
      return result;

    } catch (error) {
      logger.error('Presigned URL 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 파일 삭제 (추후 필요시 사용)
   * @param {string} s3Key - S3 객체 키
   */
  async deleteFile(s3Key) {
    try {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: s3Key,
      });

      await s3Client.send(command);
      logger.info('파일 삭제 완료', { s3Key });
      
    } catch (error) {
      logger.error('파일 삭제 실패:', { s3Key, error });
      throw error;
    }
  }

  /**
   * 파일 메타데이터 조회 (추후 필요시 사용)
   * @param {string} s3Key - S3 객체 키
   */
  async getFileMetadata(s3Key) {
    try {
      const { HeadObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new HeadObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: s3Key,
      });

      const result = await s3Client.send(command);
      return result;
      
    } catch (error) {
      logger.error('파일 메타데이터 조회 실패:', { s3Key, error });
      throw error;
    }
  }
}

module.exports = new UploadService();