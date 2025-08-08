const uploadService = require('../services/uploadService');
const logger = require('../config/logger');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: 이미지 업로드 관련 API
 * components:
 *   schemas:
 *     PresignedUrlRequest:
 *       type: object
 *       required:
 *         - fileName
 *         - fileType
 *         - uploadType
 *       properties:
 *         fileName:
 *           type: string
 *           example: "profile-image.jpg"
 *           description: 원본 파일명
 *         fileType:
 *           type: string
 *           enum: [image/jpeg, image/png, image/jpg, image/webp]
 *           example: "image/jpeg"
 *           description: 파일 MIME 타입
 *         uploadType:
 *           type: string
 *           enum: [profile, marking, course_cover]
 *           example: "profile"
 *           description: 업로드 타입
 *     PresignedUrlResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "업로드 URL이 생성되었습니다."
 *         data:
 *           type: object
 *           properties:
 *             uploadUrl:
 *               type: string
 *               example: "https://your-bucket.s3.amazonaws.com/profiles/1234-uuid.jpg?X-Amz-Algorithm=..."
 *               description: "S3에 파일을 업로드할 Presigned URL"
 *             fileUrl:
 *               type: string
 *               example: "https://your-bucket.s3.amazonaws.com/profiles/1234-uuid.jpg"
 *               description: "업로드 완료 후 파일에 접근할 수 있는 URL"
 *             fileName:
 *               type: string
 *               example: "1234-uuid.jpg"
 *               description: "S3에 저장되는 고유한 파일명"
 *             expiresIn:
 *               type: integer
 *               example: 300
 *               description: "Presigned URL 만료 시간(초)"
 */
class UploadController {

  /**
   * @swagger
   * /api/v1/upload/presigned-url:
   *   post:
   *     tags: [Upload]
   *     summary: S3 업로드용 Presigned URL 생성
   *     description: "이미지 파일을 S3에 업로드하기 위한 Presigned URL을 생성합니다. 클라이언트는 이 URL을 사용해 직접 S3에 파일을 업로드할 수 있습니다."
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PresignedUrlRequest'
   *     responses:
   *       '200':
   *         description: Presigned URL 생성 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PresignedUrlResponse'
   *       '400':
   *         description: 잘못된 요청 (필수 파라미터 누락 또는 유효하지 않은 파일 타입)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       '500':
   *         description: 서버 오류
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async generatePresignedUrl(req, res) {
    try {
      logger.info('Presigned URL 생성 요청 시작');

      const { fileName, fileType, uploadType } = req.body;

      // 필수 파라미터 유효성 검증
      if (!fileName || !fileType || !uploadType) {
        return res.status(400).json({
          success: false,
          message: '파일명, 파일타입, 업로드타입은 필수입니다.',
          code: 'MISSING_REQUIRED_PARAMETERS'
        });
      }

      // 업로드 서비스 호출
      const result = await uploadService.generatePresignedUrl({
        fileName,
        fileType,
        uploadType
      });

      logger.info('Presigned URL 생성 완료', { fileName: result.fileName });

      return res.status(200).json({
        success: true,
        message: '업로드 URL이 생성되었습니다.',
        data: result
      });

    } catch (error) {
      logger.error('Presigned URL 생성 실패:', error);

      if (error.message.includes('지원되지 않는')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'INVALID_PARAMETER'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Presigned URL 생성 중 오류가 발생했습니다.',
        code: 'PRESIGNED_URL_GENERATION_ERROR'
      });
    }
  }
}

module.exports = new UploadController();