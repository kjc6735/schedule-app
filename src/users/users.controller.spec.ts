import { Test, TestingModule } from '@nestjs/testing';
import { mockUser } from '../../test/helpers/fixtures';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    usersService = {
      getUser: vi.fn(),
      getUsers: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return UserDto when user exists', async () => {
      usersService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser(1);

      expect(usersService.getUser).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(UserDto.from(mockUser));
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.getUser.mockResolvedValue(null);

      await expect(controller.getUser(999)).rejects.toThrow('유저를 찾을 수 없습니다.');
    });
  });

  describe('getUsers', () => {
    it('should return paginated UserDto array', async () => {
      const paginated = { data: [mockUser], hasNext: false };
      usersService.getUsers.mockResolvedValue(paginated);

      const result = await controller.getUsers({ page: 1, take: 20 });

      expect(usersService.getUsers).toHaveBeenCalledWith({ page: 1, take: 20 });
      expect(result.hasNext).toBe(false);
      expect(result.data).toEqual(UserDto.fromArray([mockUser]));
    });
  });
});
