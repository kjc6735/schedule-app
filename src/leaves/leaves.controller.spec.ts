import { Test, TestingModule } from '@nestjs/testing';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { mockLeave, mockJwtPayload, mockAdminJwtPayload } from '../../test/helpers/fixtures';

describe('LeavesController', () => {
  let controller: LeavesController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      createLeave: vi.fn(),
      findLeaveById: vi.fn(),
      findLeavesByDateRange: vi.fn(),
      updateStatusByAdmin: vi.fn(),
      updateLeaveByUser: vi.fn(),
      deleteLeave: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [{ provide: LeavesService, useValue: service }],
    }).compile();

    controller = module.get<LeavesController>(LeavesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findLeaveById', () => {
    it('should call service.findLeaveById and return result', async () => {
      service.findLeaveById.mockResolvedValue(mockLeave);

      const result = await controller.findLeaveById(1);

      expect(service.findLeaveById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLeave);
    });
  });

  describe('findLeavesByDateRange', () => {
    it('should call service.findLeavesByDateRange and return result', async () => {
      const dto = {
        start: new Date('2026-02-01'),
        end: new Date('2026-02-28'),
      };
      service.findLeavesByDateRange.mockResolvedValue([mockLeave]);

      const result = await controller.findLeavesByDateRange(dto);

      expect(service.findLeavesByDateRange).toHaveBeenCalledWith(dto);
      expect(result).toEqual([mockLeave]);
    });
  });

  describe('updateStatusByAdmin', () => {
    it('should call service.updateStatusByAdmin and return result', async () => {
      const updatedLeave = { ...mockLeave, status: 'approved' };
      service.updateStatusByAdmin.mockResolvedValue(updatedLeave);
      const body = { status: 'approved' as any };

      const result = await controller.updateStatusByAdmin(1, mockAdminJwtPayload as any, body);

      expect(service.updateStatusByAdmin).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        1,
        body,
      );
      expect(result).toEqual(updatedLeave);
    });
  });

  describe('updateLeaveByUser', () => {
    it('should call service.updateLeaveByUser and return result', async () => {
      service.updateLeaveByUser.mockResolvedValue(mockLeave);
      const body = { reason: '변경사유' };

      const result = await controller.updateLeaveByUser(1, mockJwtPayload as any, body);

      expect(service.updateLeaveByUser).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        1,
        body,
      );
      expect(result).toEqual(mockLeave);
    });
  });

  describe('deleteLeave', () => {
    it('should call service.deleteLeave with user.sub and leaveId', async () => {
      service.deleteLeave.mockResolvedValue(undefined);

      const result = await controller.deleteLeave(1, mockJwtPayload as any);

      expect(service.deleteLeave).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        1,
      );
      expect(result).toBeUndefined();
    });
  });
});
