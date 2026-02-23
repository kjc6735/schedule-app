import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
  blue: '\x1b[34m',
  orange: '\x1b[38;5;208m',
} as const;

function colorMethod(method: string): string {
  const colors: Record<string, string> = {
    GET: C.cyan,
    POST: C.green,
    PATCH: C.yellow,
    PUT: C.magenta,
    DELETE: C.red,
  };
  const color = colors[method] ?? C.white;
  return `${color}${C.bold}${method.padEnd(6)}${C.reset}`;
}

function colorStatus(status: number): string {
  const color = status < 300 ? C.green : status < 500 ? C.yellow : C.red;
  return `${color}${C.bold}${status}${C.reset}`;
}

function timestamp(): string {
  return `${C.gray}${new Date().toLocaleTimeString('ko-KR', { hour12: false })}${C.reset}`;
}

/** JSON 문자열에 syntax highlight 적용 */
function highlight(json: string): string {
  return json
    // 문자열 값: 초록
    .replace(/"([^"\\]|\\.)*"/g, (match, _, offset, str) => {
      // key인지 value인지 구분: 앞에 공백+따옴표면 key
      const before = str.slice(0, offset).trimEnd();
      const isKey = before.endsWith('{') || before.endsWith(',');
      return isKey
        ? `${C.cyan}"${match.slice(1, -1)}"${C.reset}`   // key: 청록
        : `${C.green}${match}${C.reset}`;                 // value string: 초록
    })
    // 숫자: 노랑
    .replace(/: (\d+\.?\d*)/g, `: ${C.yellow}$1${C.reset}`)
    // boolean / null: 주황
    .replace(/: (true|false|null)/g, `: ${C.orange}$1${C.reset}`)
    // 괄호: 흰색 (ANSI 이스케이프 시퀀스 내부의 '[' 는 건드리지 않음)
    .replace(/(?<!\x1b)([{}\[\]])/g, `${C.white}$1${C.reset}`);
}

function formatBody(body: unknown): string | null {
  if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
    return null;
  }
  const pretty = JSON.stringify(body, null, 2);
  const colored = highlight(pretty);
  // 각 줄 앞에 들여쓰기 추가
  const indented = colored
    .split('\n')
    .map((line) => `  ${C.gray}│${C.reset}  ${line}`)
    .join('\n');
  return indented;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url, body } = req;
    const start = Date.now();

    const reqBody = formatBody(body);
    console.log(
      `${timestamp()}  ${C.gray}→${C.reset}  ${colorMethod(method)} ${C.white}${url}${C.reset}`,
    );
    if (reqBody) console.log(reqBody);

    return next.handle().pipe(
      tap((responseBody) => {
        const ms = Date.now() - start;
        const msStr =
          ms < 200
            ? `${C.green}${ms}ms${C.reset}`
            : ms < 1000
              ? `${C.yellow}${ms}ms${C.reset}`
              : `${C.red}${ms}ms${C.reset}`;
        const resBody = formatBody(responseBody);
        console.log(
          `${timestamp()}  ${C.gray}←${C.reset}  ${colorMethod(method)} ${colorStatus(res.statusCode)}  ${C.gray}${url}${C.reset}  ${msStr}`,
        );
        if (resBody) console.log(resBody);
        console.log('');
      }),
    );
  }
}
