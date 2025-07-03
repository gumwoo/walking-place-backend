const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const PHOTO_ZONE_CONFIG = require('../config/photoZoneConfig');

/**
 * 이미지 업로드 및 처리 서비스
 * 포토존 사진 업로드를 위한 multer 설정 및 이미지 처리
 * 설정 파일을 활용한 확장 가능한 구조
 */
class ImageUploadService {

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.photozoneDir = path.join(this.uploadDir, 'photozone');
    this.initializeDirectories();
  }

  /**
   * 업로드 디렉토리 초기화
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.photozoneDir, { recursive: true });
      logger.info('이미지 업로드 디렉토리 초기화 완료');
    } catch (error) {
      logger.error('업로드 디렉토리 생성 실패:', error);
    }
  }

  /**
   * Multer 스토리지 설정
   */
  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.photozoneDir);
      },
      filename: (req, file, cb) => {
        // UUID + 타임스탬프로 고유한 파일명 생성
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}_${Date.now()}${ext}`;
        cb(null, filename);
      }
    });
  }

  /**
   * 파일 필터 설정 (이미지만 허용)
   */
  getFileFilter() {
    return (req, file, cb) => {
      // 설정에서 허용된 MIME 타입 확인
      if (PHOTO_ZONE_CONFIG.UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(PHOTO_ZONE_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE), false);
      }
    };
  }

  /**
   * Multer 인스턴스 생성
   */
  getMulterInstance() {
    return multer({
      storage: this.getStorage(),
      fileFilter: this.getFileFilter(),
      limits: {
        fileSize: PHOTO_ZONE_CONFIG.UPLOAD.MAX_FILE_SIZE,
        files: 1 // 한 번에 1개 파일만
      }
    });
  }

  /**
   * 이미지 최적화 처리 (리사이징 + 압축)
   * @param {string} filepath - 원본 파일 경로
   * @param {Object} customOptions - 커스텀 최적화 옵션
   * @returns {string} 최적화된 파일 경로
   */
  async optimizeImage(filepath, customOptions = {}) {
    try {
      // 설정에서 기본값 가져오고 커스텀 옵션으로 덮어쓰기
      const options = {
        ...PHOTO_ZONE_CONFIG.IMAGE_OPTIMIZATION,
        ...customOptions
      };

      // 최적화된 파일명 생성
      const parsedPath = path.parse(filepath);
      const optimizedFilename = `${parsedPath.name}_optimized.${options.FORMAT}`;
      const optimizedPath = path.join(parsedPath.dir, optimizedFilename);

      // Sharp를 사용한 이미지 최적화
      await sharp(filepath)
        .resize(options.MAX_WIDTH, options.MAX_HEIGHT, {
          fit: 'inside',          // 비율 유지하면서 크기 조정
          withoutEnlargement: true // 작은 이미지는 확대하지 않음
        })
        .jpeg({ 
          quality: options.QUALITY,
          progressive: true       // 점진적 로딩
        })
        .toFile(optimizedPath);

      // 원본 파일 삭제
      await fs.unlink(filepath);

      logger.info(`이미지 최적화 완료: ${optimizedFilename}`);
      return optimizedPath;

    } catch (error) {
      logger.error('이미지 최적화 중 오류:', error);
      throw new Error('이미지 처리 중 오류가 발생했습니다');
    }
  }

  /**
   * 파일 삭제
   * @param {string} filepath - 삭제할 파일 경로
   */
  async deleteFile(filepath) {
    try {
      const fullPath = path.join(process.cwd(), filepath);
      await fs.unlink(fullPath);
      logger.info(`파일 삭제 완료: ${filepath}`);
    } catch (error) {
      logger.error(`파일 삭제 실패: ${filepath}`, error);
    }
  }

  /**
   * 파일 존재 여부 확인
   * @param {string} filepath - 확인할 파일 경로
   * @returns {boolean} 파일 존재 여부
   */
  async fileExists(filepath) {
    try {
      const fullPath = path.join(process.cwd(), filepath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 업로드된 파일 정보 반환
   * @param {Object} file - multer file 객체
   * @returns {Object} 파일 정보
   */
  getFileInfo(file) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `${PHOTO_ZONE_CONFIG.UPLOAD.UPLOAD_PATH}/${file.filename}`
    };
  }
}

module.exports = new ImageUploadService();
