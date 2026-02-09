import { vi } from 'vitest';

export function createMockPrismaModel() {
  return {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export type MockPrismaModel = ReturnType<typeof createMockPrismaModel>;

export function createMockPrismaService() {
  return {
    user: createMockPrismaModel(),
    product: {
      ...createMockPrismaModel(),
    },
    packagingSpec: createMockPrismaModel(),
    productionPlan: createMockPrismaModel(),
    leave: createMockPrismaModel(),
  };
}

export type MockPrismaService = ReturnType<typeof createMockPrismaService>;
