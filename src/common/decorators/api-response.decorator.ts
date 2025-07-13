import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: description || 'Success',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: getSchemaPath(model),
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-07-13T10:30:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/vaults',
          },
        },
      },
    }),
  );
};

export const ApiArrayResponse = <TModel extends Type<any>>(
  model: TModel,
  description?: string,
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: description || 'Success',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(model),
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-07-13T10:30:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/vaults',
          },
        },
      },
    }),
  );
};

export const ApiErrorResponse = (
  status: number,
  description: string,
  errorCode?: string,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: status,
          },
          message: {
            type: 'string',
            example: description,
          },
          errorCode: {
            type: 'string',
            example: errorCode || 'ERROR_CODE',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-07-13T10:30:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/vaults',
          },
        },
      },
    }),
  );
};