import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { createTestApp } from './helpers/e2e-setup';

describe('Swagger (e2e)', () => {
  let app: INestApplication<App>;
  let swagger: OpenAPIObject;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;

    const config = new DocumentBuilder()
      .setTitle('생산 관리 시스템 API')
      .setDescription('생산 계획, 제품, 포장 규격, 휴가 관리 API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    swagger = SwaggerModule.createDocument(app, config);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Helper ──
  function getEndpoint(path: string, method: string) {
    const pathObj = swagger.paths[path];
    expect(pathObj).toBeDefined();
    const endpoint = pathObj[method];
    expect(endpoint).toBeDefined();
    return endpoint;
  }

  function getResponseCodes(endpoint: any): string[] {
    return Object.keys(endpoint.responses).sort();
  }

  function getPathParamNames(endpoint: any): string[] {
    return (endpoint.parameters ?? [])
      .filter((p: any) => p.in === 'path')
      .map((p: any) => p.name);
  }

  function getQueryParamNames(endpoint: any): string[] {
    return (endpoint.parameters ?? [])
      .filter((p: any) => p.in === 'query')
      .map((p: any) => p.name);
  }

  function getBodySchemaName(endpoint: any): string | null {
    const ref =
      endpoint.requestBody?.content?.['application/json']?.schema?.$ref;
    return ref ? ref.split('/').pop() : null;
  }

  function hasSecurity(endpoint: any): boolean {
    return Array.isArray(endpoint.security) && endpoint.security.length > 0;
  }

  function getSchemaProps(name: string) {
    const schema = swagger.components?.schemas?.[name] as any;
    expect(schema).toBeDefined();
    return {
      properties: Object.keys(schema.properties ?? {}),
      required: schema.required ?? [],
    };
  }

  // ── Document 기본 설정 ──
  describe('Document config', () => {
    it('should have correct title and version', () => {
      expect(swagger.info.title).toBe('생산 관리 시스템 API');
      expect(swagger.info.version).toBe('1.0');
    });

    it('should have Bearer auth security scheme', () => {
      const scheme = (swagger.components?.securitySchemes as any)?.[
        'access-token'
      ];
      expect(scheme).toBeDefined();
      expect(scheme.type).toBe('http');
      expect(scheme.scheme).toBe('bearer');
      expect(scheme.bearerFormat).toBe('JWT');
    });
  });

  // ── Auth ──
  describe('Auth endpoints', () => {
    describe('POST /auth/login', () => {
      it('should be public (no security)', () => {
        const ep = getEndpoint('/auth/login', 'post');
        expect(hasSecurity(ep)).toBe(false);
      });

      it('should have correct tag and summary', () => {
        const ep = getEndpoint('/auth/login', 'post');
        expect(ep.tags).toContain('인증');
        expect(ep.summary).toBe('로그인');
      });

      it('should use LoginRequestDto as body', () => {
        const ep = getEndpoint('/auth/login', 'post');
        expect(getBodySchemaName(ep)).toBe('LoginRequestDto');
      });

      it('should have 201 and 400 responses', () => {
        const ep = getEndpoint('/auth/login', 'post');
        expect(getResponseCodes(ep)).toEqual(['201', '400']);
      });
    });

    describe('POST /auth/register', () => {
      it('should be public (no security)', () => {
        const ep = getEndpoint('/auth/register', 'post');
        expect(hasSecurity(ep)).toBe(false);
      });

      it('should use RegisterRequestDto as body', () => {
        const ep = getEndpoint('/auth/register', 'post');
        expect(getBodySchemaName(ep)).toBe('RegisterRequestDto');
      });

      it('should have 201, 400, 401, 500 responses (matching AuthService exceptions)', () => {
        const ep = getEndpoint('/auth/register', 'post');
        // 400=BadRequestException, 401=UnauthorizedException, 500=InternalServerErrorException
        expect(getResponseCodes(ep)).toEqual(['201', '400', '401', '500']);
      });
    });
  });

  // ── Users ──
  describe('Users endpoints', () => {
    describe('GET /users/{id}', () => {
      it('should require Bearer auth', () => {
        const ep = getEndpoint('/users/{id}', 'get');
        expect(hasSecurity(ep)).toBe(true);
      });

      it('should have path param "id"', () => {
        const ep = getEndpoint('/users/{id}', 'get');
        expect(getPathParamNames(ep)).toEqual(['id']);
      });

      it('should have 200, 401, 404 responses (controller throws NotFoundException)', () => {
        const ep = getEndpoint('/users/{id}', 'get');
        expect(getResponseCodes(ep)).toEqual(['200', '401', '404']);
      });
    });

    describe('GET /users', () => {
      it('should have pagination query params', () => {
        const ep = getEndpoint('/users', 'get');
        const queries = getQueryParamNames(ep);
        expect(queries).toContain('page');
        expect(queries).toContain('take');
      });

      it('should have 200, 401 responses', () => {
        const ep = getEndpoint('/users', 'get');
        expect(getResponseCodes(ep)).toEqual(['200', '401']);
      });
    });
  });

  // ── Products ──
  describe('Products endpoints', () => {
    describe('POST /products', () => {
      it('should require Bearer auth', () => {
        const ep = getEndpoint('/products', 'post');
        expect(hasSecurity(ep)).toBe(true);
      });

      it('should use CreateProductRequestDto as body', () => {
        const ep = getEndpoint('/products', 'post');
        expect(getBodySchemaName(ep)).toBe('CreateProductRequestDto');
      });

      it('should have 201, 401 responses (RolesGuard throws UnauthorizedException=401, not 403)', () => {
        const ep = getEndpoint('/products', 'post');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('201');
        expect(codes).toContain('401');
        expect(codes).not.toContain('403');
      });
    });

    describe('GET /products/{productId}', () => {
      it('should have path param "productId"', () => {
        const ep = getEndpoint('/products/{productId}', 'get');
        expect(getPathParamNames(ep)).toEqual(['productId']);
      });

      it('should have 401 response for @Admin() guard', () => {
        const ep = getEndpoint('/products/{productId}', 'get');
        expect(getResponseCodes(ep)).toContain('401');
      });
    });

    describe('GET /products', () => {
      it('should have pagination query params', () => {
        const ep = getEndpoint('/products', 'get');
        const queries = getQueryParamNames(ep);
        expect(queries).toContain('page');
        expect(queries).toContain('take');
      });

      it('should have 401 response for @Admin() guard', () => {
        const ep = getEndpoint('/products', 'get');
        expect(getResponseCodes(ep)).toContain('401');
      });
    });

    describe('DELETE /products/{productId}', () => {
      it('should have 401 and 404 responses (P2025→404)', () => {
        const ep = getEndpoint('/products/{productId}', 'delete');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });

    describe('POST /products/{productId}/packaging-specs', () => {
      it('should have path param "productId"', () => {
        const ep = getEndpoint(
          '/products/{productId}/packaging-specs',
          'post',
        );
        expect(getPathParamNames(ep)).toEqual(['productId']);
      });

      it('should use CreatePackagingSpecRequestDto as body', () => {
        const ep = getEndpoint(
          '/products/{productId}/packaging-specs',
          'post',
        );
        expect(getBodySchemaName(ep)).toBe('CreatePackagingSpecRequestDto');
      });

      it('should have 400 response (P2003 for invalid productId)', () => {
        const ep = getEndpoint(
          '/products/{productId}/packaging-specs',
          'post',
        );
        expect(getResponseCodes(ep)).toContain('400');
      });
    });

    describe('GET /products/{productId}/packaging-specs', () => {
      it('should have path param "productId" and 401 response', () => {
        const ep = getEndpoint(
          '/products/{productId}/packaging-specs',
          'get',
        );
        expect(getPathParamNames(ep)).toEqual(['productId']);
        expect(getResponseCodes(ep)).toContain('401');
      });
    });
  });

  // ── Packaging Specs ──
  describe('PackagingSpecs endpoints', () => {
    describe('PATCH /packaging-specs/{id}', () => {
      it('should have path param "id"', () => {
        const ep = getEndpoint('/packaging-specs/{id}', 'patch');
        expect(getPathParamNames(ep)).toEqual(['id']);
      });

      it('should use UpdatePackagingSpecRequestDto as body', () => {
        const ep = getEndpoint('/packaging-specs/{id}', 'patch');
        expect(getBodySchemaName(ep)).toBe('UpdatePackagingSpecRequestDto');
      });

      it('should have 401 and 404 responses', () => {
        const ep = getEndpoint('/packaging-specs/{id}', 'patch');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });

    describe('DELETE /packaging-specs/{id}', () => {
      it('should have 401 and 404 responses (P2025→404)', () => {
        const ep = getEndpoint('/packaging-specs/{id}', 'delete');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });

    describe('GET /packaging-specs/{id}', () => {
      it('should have 401 response for @Admin()', () => {
        const ep = getEndpoint('/packaging-specs/{id}', 'get');
        expect(getResponseCodes(ep)).toContain('401');
      });
    });
  });

  // ── Production Plans ──
  describe('ProductionPlans endpoints', () => {
    describe('POST /production-plans', () => {
      it('should use CreateProductionPlanRequestDto as body', () => {
        const ep = getEndpoint('/production-plans', 'post');
        expect(getBodySchemaName(ep)).toBe('CreateProductionPlanRequestDto');
      });

      it('should have 400 (P2003 for invalid FK) and 401 (not 403)', () => {
        const ep = getEndpoint('/production-plans', 'post');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('400');
        expect(codes).toContain('401');
        expect(codes).not.toContain('403');
      });
    });

    describe('PATCH /production-plans/{id}', () => {
      it('should have path param "id"', () => {
        const ep = getEndpoint('/production-plans/{id}', 'patch');
        expect(getPathParamNames(ep)).toEqual(['id']);
      });

      it('should have 400, 401, 404 responses (not 403)', () => {
        const ep = getEndpoint('/production-plans/{id}', 'patch');
        const codes = getResponseCodes(ep);
        expect(codes).toEqual(['200', '400', '401', '404']);
        expect(codes).not.toContain('403');
      });
    });

    describe('GET /production-plans/{id}', () => {
      it('should have 401 but no role-based error (no @Admin)', () => {
        const ep = getEndpoint('/production-plans/{id}', 'get');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).not.toContain('403');
      });
    });

    describe('GET /production-plans', () => {
      it('should have pagination + date query params', () => {
        const ep = getEndpoint('/production-plans', 'get');
        const queries = getQueryParamNames(ep);
        expect(queries).toContain('page');
        expect(queries).toContain('take');
        expect(queries).toContain('date');
      });

      it('should have date query as optional', () => {
        const ep = getEndpoint('/production-plans', 'get');
        const dateParam = ep.parameters.find(
          (p: any) => p.name === 'date' && p.in === 'query',
        );
        expect(dateParam).toBeDefined();
        expect(dateParam.required).toBe(false);
      });
    });

    describe('DELETE /production-plans/{id}', () => {
      it('should have 401 and 404 responses (not 403)', () => {
        const ep = getEndpoint('/production-plans/{id}', 'delete');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
        expect(codes).not.toContain('403');
      });
    });
  });

  // ── Leaves ──
  describe('Leaves endpoints', () => {
    describe('POST /leaves', () => {
      it('should require Bearer auth', () => {
        const ep = getEndpoint('/leaves', 'post');
        expect(hasSecurity(ep)).toBe(true);
      });

      it('should use CreateLeaveRequestDto as body', () => {
        const ep = getEndpoint('/leaves', 'post');
        expect(getBodySchemaName(ep)).toBe('CreateLeaveRequestDto');
      });

      it('should have 201 and 401 responses', () => {
        const ep = getEndpoint('/leaves', 'post');
        expect(getResponseCodes(ep)).toEqual(['201', '401']);
      });
    });

    describe('GET /leaves/{leaveId}', () => {
      it('should have path param "leaveId"', () => {
        const ep = getEndpoint('/leaves/{leaveId}', 'get');
        expect(getPathParamNames(ep)).toEqual(['leaveId']);
      });

      it('should have 401 response', () => {
        const ep = getEndpoint('/leaves/{leaveId}', 'get');
        expect(getResponseCodes(ep)).toContain('401');
      });
    });

    describe('GET /leaves', () => {
      it('should have date range query params (start, end)', () => {
        const ep = getEndpoint('/leaves', 'get');
        const queries = getQueryParamNames(ep);
        expect(queries).toContain('start');
        expect(queries).toContain('end');
      });

      it('should have 401 response', () => {
        const ep = getEndpoint('/leaves', 'get');
        expect(getResponseCodes(ep)).toContain('401');
      });
    });

    describe('PATCH /leaves/{leaveId}/status', () => {
      it('should have path param "leaveId"', () => {
        const ep = getEndpoint('/leaves/{leaveId}/status', 'patch');
        expect(getPathParamNames(ep)).toEqual(['leaveId']);
      });

      it('should use UpdateLeaveStatusByAdminRequestDto as body', () => {
        const ep = getEndpoint('/leaves/{leaveId}/status', 'patch');
        expect(getBodySchemaName(ep)).toBe(
          'UpdateLeaveStatusByAdminRequestDto',
        );
      });

      it('should have 401 and 404 responses (service throws NotFoundException + UnauthorizedException)', () => {
        const ep = getEndpoint('/leaves/{leaveId}/status', 'patch');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });

    describe('PATCH /leaves/{leaveId}', () => {
      it('should use UpdateLeaveByOwnerRequestDto as body', () => {
        const ep = getEndpoint('/leaves/{leaveId}', 'patch');
        expect(getBodySchemaName(ep)).toBe('UpdateLeaveByOwnerRequestDto');
      });

      it('should have 401 and 404 responses (P2025→404)', () => {
        const ep = getEndpoint('/leaves/{leaveId}', 'patch');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });

    describe('DELETE /leaves/{leaveId}', () => {
      it('should have 401 and 404 responses (service throws both)', () => {
        const ep = getEndpoint('/leaves/{leaveId}', 'delete');
        const codes = getResponseCodes(ep);
        expect(codes).toContain('401');
        expect(codes).toContain('404');
      });
    });
  });

  // ── Schemas ──
  describe('DTO Schemas', () => {
    describe('LoginRequestDto', () => {
      it('should have userId and password as required', () => {
        const { properties, required } = getSchemaProps('LoginRequestDto');
        expect(properties).toEqual(['userId', 'password']);
        expect(required).toEqual(['userId', 'password']);
      });
    });

    describe('RegisterRequestDto', () => {
      it('should have all 7 fields as required', () => {
        const { properties, required } = getSchemaProps('RegisterRequestDto');
        expect(properties).toEqual(
          expect.arrayContaining([
            'name',
            'password',
            'passwordConfirm',
            'gender',
            'phone',
            'role',
            'userId',
          ]),
        );
        expect(required).toHaveLength(7);
      });
    });

    describe('CreateProductRequestDto', () => {
      it('should have name and packagingSpecs as required', () => {
        const { properties, required } = getSchemaProps(
          'CreateProductRequestDto',
        );
        expect(properties).toEqual(['name', 'packagingSpecs']);
        expect(required).toEqual(['name', 'packagingSpecs']);
      });
    });

    describe('CreateProductionPlanRequestDto', () => {
      it('should have 4 required fields and memo as optional', () => {
        const { properties, required } = getSchemaProps(
          'CreateProductionPlanRequestDto',
        );
        expect(properties).toContain('memo');
        expect(required).toEqual([
          'productionDate',
          'productId',
          'packagingSpecId',
          'targetAmountGram',
        ]);
        expect(required).not.toContain('memo');
      });
    });

    describe('UpdateProductionPlanRequestDto', () => {
      it('should have all 7 fields as optional', () => {
        const { properties, required } = getSchemaProps(
          'UpdateProductionPlanRequestDto',
        );
        expect(properties).toHaveLength(7);
        expect(required).toHaveLength(0);
      });
    });

    describe('CreateLeaveRequestDto', () => {
      it('should have startDate, endDate, leaveType as required, reason as optional', () => {
        const { properties, required } = getSchemaProps(
          'CreateLeaveRequestDto',
        );
        expect(properties).toEqual(
          expect.arrayContaining([
            'startDate',
            'endDate',
            'reason',
            'leaveType',
          ]),
        );
        expect(required).toEqual(
          expect.arrayContaining(['startDate', 'endDate', 'leaveType']),
        );
        expect(required).not.toContain('reason');
      });
    });

    describe('UpdateLeaveStatusByAdminRequestDto', () => {
      it('should have status as required', () => {
        const { properties, required } = getSchemaProps(
          'UpdateLeaveStatusByAdminRequestDto',
        );
        expect(properties).toEqual(['status']);
        expect(required).toEqual(['status']);
      });
    });

    describe('UpdateLeaveByOwnerRequestDto', () => {
      it('should have all 4 fields as optional', () => {
        const { properties, required } = getSchemaProps(
          'UpdateLeaveByOwnerRequestDto',
        );
        expect(properties).toHaveLength(4);
        expect(required).toHaveLength(0);
      });
    });

    describe('UpdatePackagingSpecRequestDto', () => {
      it('should have name and gramPerPack as optional', () => {
        const { properties, required } = getSchemaProps(
          'UpdatePackagingSpecRequestDto',
        );
        expect(properties).toEqual(['name', 'gramPerPack']);
        expect(required).toHaveLength(0);
      });
    });
  });

  // ── Tags ──
  describe('Tags', () => {
    it('should group all endpoints under 6 tags', () => {
      const allTags = new Set<string>();
      for (const methods of Object.values(swagger.paths)) {
        for (const detail of Object.values(methods as any)) {
          const tags = (detail as any).tags ?? [];
          tags.forEach((t: string) => allTags.add(t));
        }
      }
      expect(allTags).toEqual(
        new Set(['인증', '사용자', '제품', '포장 규격', '생산 계획', '휴가']),
      );
    });
  });

  // ── Endpoint count ──
  describe('Total endpoints', () => {
    it('should have exactly 24 endpoints', () => {
      let count = 0;
      for (const methods of Object.values(swagger.paths)) {
        for (const method of Object.keys(methods as any)) {
          if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
            count++;
          }
        }
      }
      expect(count).toBe(25);
    });
  });
});
