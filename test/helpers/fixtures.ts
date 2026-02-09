export const mockUser = {
  id: 1,
  userId: 'testuser',
  password: '$2b$10$hashedpassword',
  name: '테스트유저',
  phone: '01012345678',
  gender: 'male' as const,
  role: 'worker' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

export const mockAdminUser = {
  ...mockUser,
  id: 2,
  userId: 'admin',
  name: '관리자',
  phone: '01099998888',
  role: 'manager' as const,
};

export const mockProduct = {
  id: 1,
  name: '테스트제품',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

export const mockPackagingSpec = {
  id: 1,
  productId: 1,
  name: '소포장',
  gramPerPack: 500,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

export const mockProductionPlan = {
  id: 1,
  productionDate: new Date('2026-02-01'),
  productId: 1,
  packagingSpecId: 1,
  targetAmountGram: 10000,
  resultAmountGram: null,
  resultPackCount: null,
  memo: '메모',
  createdById: 2,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

export const mockLeave = {
  id: 1,
  userId: 1,
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-12'),
  reason: '개인사유',
  totalDays: 0,
  status: 'requested' as const,
  leaveType: 'annual' as const,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const mockJwtPayload = {
  sub: 1,
  userId: 'testuser',
  role: 'worker' as const,
  type: 'access_token' as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const mockAdminJwtPayload = {
  sub: 2,
  userId: 'admin',
  role: 'manager' as const,
  type: 'access_token' as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};
