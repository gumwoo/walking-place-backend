const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger 설정
 * API 문서화 자동 생성
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '산책명소 API',
      version: '1.0.0',
      description: '반려견 산책 코스 추천 및 공유 플랫폼 API',
      contact: {
        name: 'Walking Places Team',
        email: 'support@walkingplaces.com'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 입력하세요'
        }
      },
      schemas: {
        // 공통 응답 스키마
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '요청 성공 여부'
            },
            message: {
              type: 'string',
              description: '응답 메시지'
            },
            data: {
              description: '응답 데이터'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '응답 시간'
            }
          }
        },
        // 에러 응답 스키마
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: '에러 메시지'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        // 페이지네이션 스키마
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'array',
              items: {}
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'integer' },
                totalPages: { type: 'integer' },
                totalItems: { type: 'integer' },
                itemsPerPage: { type: 'integer' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: '인증 관련 API'
      },
      {
        name: 'Users',
        description: '사용자 관리 API'
      },
      {
        name: 'Courses',
        description: '코스 관리 API'
      },
      {
        name: 'Walks',
        description: '산책 기록 API'
      },
      {
        name: 'Photos',
        description: '사진 관리 API'
      },
      {
        name: 'Photozones',
        description: '포토존 관리 API'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

/**
 * Swagger UI 설정
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none', // API 문서 기본 접힘 상태
    filter: true, // 검색 기능 활성화
    showRequestDuration: true, // 요청 시간 표시
    tryItOutEnabled: true, // Try it out 기능 활성화
    requestInterceptor: (req) => {
      // 요청 인터셉터 (필요시 사용)
      return req;
    }
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .info .description { color: #6b7280; }
    .swagger-ui .scheme-container { background: #f9fafb; }
  `,
  customSiteTitle: '산책명소 API 문서',
  customfavIcon: '/favicon.ico'
};

/**
 * Swagger 미들웨어 설정
 * @param {Object} app - Express 앱 인스턴스
 */
const setupSwagger = (app) => {
  // API 문서 JSON 엔드포인트
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI 엔드포인트
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  const port = process.env.PORT || 5000;

  if (process.env.NODE_ENV === "development") {
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
  } else {
    console.log(`📚 Swagger UI: /api-docs`);
  }
};

module.exports = {
  swaggerSpec,
  setupSwagger
};
