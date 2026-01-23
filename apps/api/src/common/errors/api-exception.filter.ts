import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, type ApiErrorResponse } from '@tracked/shared';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: any = ctx.getRequest();

    const traceId = request?.traceId || 'unknown';

    let statusCode: number;
    let message: string;
    let code: string;
    let details: unknown | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;

        // Для 400 (валидация) прокидываем details, если есть
        if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = resp.message;
        } else if (statusCode === HttpStatus.BAD_REQUEST && resp.errors) {
          message = resp.message || 'Validation failed';
          details = resp.errors;
        } else if (statusCode === HttpStatus.BAD_REQUEST && resp.details) {
          message = resp.message || 'Validation failed';
          details = resp.details;
        } else {
          message = resp.message || exception.message || 'Bad Request';
        }
      } else {
        message = exception.message || 'Bad Request';
      }

      // Маппинг статуса на код
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          code = ErrorCodes.VALIDATION_ERROR;
          break;
        case HttpStatus.UNAUTHORIZED:
          code = ErrorCodes.UNAUTHORIZED;
          break;
        case HttpStatus.FORBIDDEN:
          code = ErrorCodes.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          code = ErrorCodes.NOT_FOUND;
          break;
        case HttpStatus.CONFLICT:
          code = ErrorCodes.CONFLICT;
          break;
        default:
          code = ErrorCodes.INTERNAL_ERROR;
      }
    } else {
      // Не HttpException - внутренняя ошибка
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      code = ErrorCodes.INTERNAL_ERROR;
      details = undefined;
    }

    const errorResponse: ApiErrorResponse = {
      statusCode,
      code: code as any,
      message,
      traceId,
      ...(details !== undefined && { details }),
    };

    // Fastify reply API
    response.code(statusCode).send(errorResponse);
  }
}
