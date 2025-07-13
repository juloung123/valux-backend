import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Valux.finance Backend API')
  .setDescription(`
    # Valux.finance DeFi Automation Platform API

    This API provides comprehensive access to the Valux.finance platform for DeFi automation and yield farming management.

    ## Features
    - **Vault Management**: Browse and interact with DeFi vaults
    - **Portfolio Tracking**: Monitor your investments and performance
    - **Automation Rules**: Create and manage profit distribution rules
    - **Analytics**: Platform-wide metrics and insights
    - **Authentication**: Secure Web3 wallet-based authentication

    ## Authentication
    This API uses JWT tokens with Web3 signature verification. To authenticate:
    1. Get a nonce from \`GET /api/auth/nonce\`
    2. Sign the nonce with your wallet
    3. Submit the signature to \`POST /api/auth/login\`
    4. Use the returned JWT token in the \`Authorization: Bearer <token>\` header

    ## Rate Limiting
    - **Global**: 100 requests per minute per IP
    - **Authentication**: 10 login attempts per hour per IP
    - **Heavy operations**: Additional rate limits may apply

    ## Error Handling
    All errors follow a consistent format:
    \`\`\`json
    {
      "statusCode": 400,
      "message": "Error description",
      "errorCode": "ERROR_CODE",
      "timestamp": "2023-07-13T10:30:00.000Z",
      "path": "/api/endpoint"
    }
    \`\`\`

    ## Pagination
    List endpoints support pagination with the following parameters:
    - \`page\`: Page number (default: 1)
    - \`limit\`: Items per page (default: 20, max: 100)
    - \`sortBy\`: Sort field
    - \`sortOrder\`: Sort direction (asc/desc)

    ## API Versioning
    This API is versioned using URL path versioning. Current version: v1

    ## Support
    For API support, please visit our [documentation](https://docs.valux.finance) or contact support.
  `)
  .setVersion('1.0.0')
  .setContact(
    'Valux.finance Support',
    'https://valux.finance',
    'support@valux.finance'
  )
  .setLicense(
    'MIT License',
    'https://opensource.org/licenses/MIT'
  )
  .addServer('http://localhost:8080', 'Development Server')
  .addServer('https://api.valux.finance', 'Production Server')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth'
  )
  .addTag('Authentication', 'User authentication and authorization endpoints')
  .addTag('Vaults', 'DeFi vault management and information')
  .addTag('Portfolio', 'User portfolio tracking and management')
  .addTag('Rules', 'Automation rules for profit distribution')
  .addTag('Analytics', 'Platform analytics and metrics')
  .addTag('Health', 'System health and monitoring endpoints')
  .addTag('Metrics', 'Prometheus metrics for monitoring')
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  customSiteTitle: 'Valux.finance API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { 
      background-color: #1e40af; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info .title {
      color: #1e40af;
    }
    .swagger-ui .scheme-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }
    .swagger-ui .info .description {
      color: #374151;
      line-height: 1.6;
    }
    .swagger-ui .parameter__type {
      color: #059669;
      font-weight: 600;
    }
    .swagger-ui .response-col_status {
      color: #dc2626;
      font-weight: 600;
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #059669;
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #dc2626;
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #d97706;
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #7c2d12;
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 3,
    deepLinking: true,
    tryItOutEnabled: true,
  },
};