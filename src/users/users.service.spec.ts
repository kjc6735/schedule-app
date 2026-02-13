import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockUser } from '../../test/helpers/fixtures';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('should call prisma.user.findUnique with where condition', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUser({ userId: 'testuser' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUser({ userId: 'unknown' });

      expect(result).toBeNull();
    });
  });

  describe('getUsers', () => {
    it('should calculate skip correctly and use take+1', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getUsers({ page: 2, take: 10 });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 11,
      });
      expect(result.data).toHaveLength(1);
      expect(result.hasNext).toBe(false);
    });

    it('should return paginated response with hasNext=true when more items exist', async () => {
      const items = Array.from({ length: 21 }, () => mockUser);
      prisma.user.findMany.mockResolvedValue(items);

      const result = await service.getUsers({ page: 1, take: 20 });

      expect(result.data).toHaveLength(20);
      expect(result.hasNext).toBe(true);
    });

    it('should return paginated response with hasNext=false when no more items', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getUsers({ page: 1, take: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.hasNext).toBe(false);
    });
  });
});
