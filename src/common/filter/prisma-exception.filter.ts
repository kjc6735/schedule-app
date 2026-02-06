import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.getErrorResponse(exception);

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }

  private getErrorResponse(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '입력값이 너무 깁니다.',
        };
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: '이미 존재하는 데이터입니다.',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '참조하는 데이터가 존재하지 않습니다.',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: '데이터를 찾을 수 없습니다.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '데이터베이스 오류가 발생했습니다.',
        };
    }
  }
}
