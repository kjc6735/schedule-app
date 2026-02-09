import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function createMockArgumentsHost(): {
  host: ArgumentsHost;
  mockJson: ReturnType<typeof vi.fn>;
  mockStatus: ReturnType<typeof vi.fn>;
} {
  const mockJson = vi.fn();
  const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({
        status: mockStatus,
      }),
    }),
  } as unknown as ArgumentsHost;

  return { host, mockJson, mockStatus };
}

function createPrismaError(code: string) {
  const error = new Error('Prisma error') as any;
  error.code = code;
  error.name = 'PrismaClientKnownRequestError';
  return error;
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('P2000 should return 400 Bad Request', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();

    filter.catch(createPrismaError('P2000'), host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: '입력값이 너무 깁니다.',
      }),
    );
  });

  it('P2002 should return 409 Conflict', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();

    filter.catch(createPrismaError('P2002'), host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: '이미 존재하는 데이터입니다.',
      }),
    );
  });

  it('P2003 should return 400 Bad Request', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();

    filter.catch(createPrismaError('P2003'), host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: '참조하는 데이터가 존재하지 않습니다.',
      }),
    );
  });

  it('P2025 should return 404 Not Found', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();

    filter.catch(createPrismaError('P2025'), host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: '데이터를 찾을 수 없습니다.',
      }),
    );
  });

  it('unknown code should return 500 Internal Server Error', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();

    filter.catch(createPrismaError('P9999'), host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '데이터베이스 오류가 발생했습니다.',
      }),
    );
  });
});
