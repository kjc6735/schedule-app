import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '데이터 배열' })
  data: T[];

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext: boolean;

  constructor(data: T[], hasNext: boolean) {
    this.data = data;
    this.hasNext = hasNext;
  }
}

export function paginate<T>(
  items: T[],
  take: number,
): PaginatedResponseDto<T> {
  const hasNext = items.length > take;
  const data = hasNext ? items.slice(0, take) : items;
  return new PaginatedResponseDto(data, hasNext);
}
