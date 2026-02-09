import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import {
  mockAdminUser,
  mockLeave,
  mockUser,
} from '../../test/helpers/fixtures';
import { LeavesService } from './leaves.service';

describe('LeavesService', () => {
  let service: LeavesService;
  let prisma: MockPrismaService;
  let usersService: { getUser: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    usersService = { getUser: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLeave', () => {
    it('should create leave with status=requested and totalDays=0', async () => {
      prisma.leave.create.mockResolvedValue(mockLeave);

      await service.createLeave({
        userId: 1,
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-12'),
        leaveType: 'annual' as any,
      });

      expect(prisma.leave.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'requested',
          totalDays: 0,
        }),
      });
    });
  });

  describe('updateStatusByAdmin', () => {
    it('should throw NotFoundException when user not found', async () => {
      usersService.getUser.mockResolvedValue(null);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      await expect(
        service.updateStatusByAdmin(999, 1, { status: 'approved' as any }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when leave not found', async () => {
      usersService.getUser.mockResolvedValue(mockAdminUser);
      prisma.leave.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatusByAdmin(2, 999, { status: 'approved' as any }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when user is not admin', async () => {
      usersService.getUser.mockResolvedValue(mockUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      await expect(
        service.updateStatusByAdmin(1, 1, { status: 'approved' as any }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update leave status when admin', async () => {
      usersService.getUser.mockResolvedValue(mockAdminUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({
        ...mockLeave,
        status: 'approved',
      });

      const result = await service.updateStatusByAdmin(2, 1, {
        status: 'approved' as any,
      });

      expect(prisma.leave.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'approved' },
      });
      expect(result.status).toBe('approved');
    });
  });

  describe('updateLeaveByUser', () => {
    it('should update leave with userId in where condition', async () => {
      prisma.leave.update.mockResolvedValue(mockLeave);

      await service.updateLeaveByUser(1, 1, { reason: '변경사유' });

      expect(prisma.leave.update).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        data: { reason: '변경사유' },
      });
    });
  });

  describe('deleteLeave', () => {
    it('should allow admin to delete any leave', async () => {
      usersService.getUser.mockResolvedValue(mockAdminUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.delete.mockResolvedValue(undefined);

      await service.deleteLeave(2, 1);

      expect(prisma.leave.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should allow owner to delete own leave', async () => {
      usersService.getUser.mockResolvedValue(mockUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.delete.mockResolvedValue(undefined);

      await service.deleteLeave(1, 1);

      expect(prisma.leave.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw UnauthorizedException when non-admin non-owner tries to delete', async () => {
      const otherUser = { ...mockUser, id: 3 };
      usersService.getUser.mockResolvedValue(otherUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      await expect(service.deleteLeave(3, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.getUser.mockResolvedValue(null);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      await expect(service.deleteLeave(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when leave not found', async () => {
      usersService.getUser.mockResolvedValue(mockUser);
      prisma.leave.findUnique.mockResolvedValue(null);

      await expect(service.deleteLeave(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findLeaveById', () => {
    it('should find leave by id', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      const result = await service.findLeaveById(1);

      expect(prisma.leave.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockLeave);
    });
  });

  describe('findLeavesByDateRange', () => {
    it('should find leaves overlapping with date range', async () => {
      const start = new Date('2026-02-01');
      const end = new Date('2026-02-28');
      prisma.leave.findMany.mockResolvedValue([mockLeave]);

      const result = await service.findLeavesByDateRange({ start, end });

      expect(prisma.leave.findMany).toHaveBeenCalledWith({
        where: {
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });
      expect(result).toEqual([mockLeave]);
    });
  });
});
