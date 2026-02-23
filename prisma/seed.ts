import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb(process.env['DATABASE_URL']!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Users ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const workerPassword = await bcrypt.hash('worker1234', 10);

  const admin = await prisma.user.upsert({
    where: { userId: 'admin' },
    update: {},
    create: {
      userId: 'admin',
      password: adminPassword,
      name: '관리자',
      phone: '01011111111',
      gender: 'male',
      role: 'manager',
    },
  });

  const worker1 = await prisma.user.upsert({
    where: { userId: 'worker1' },
    update: {},
    create: {
      userId: 'worker1',
      password: workerPassword,
      name: '김작업자',
      phone: '01022222222',
      gender: 'male',
      role: 'worker',
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { userId: 'worker2' },
    update: {},
    create: {
      userId: 'worker2',
      password: workerPassword,
      name: '이작업자',
      phone: '01033333333',
      gender: 'female',
      role: 'worker',
    },
  });

  console.log('✓ Users created');

  // ── Products ───────────────────────────────────────────
  const gopchang = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: { name: '곱창' },
  });

  const makchang = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: { name: '막창' },
  });

  const daechang = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: { name: '대창' },
  });

  console.log('✓ Products created');

  // ── Packaging Specs ────────────────────────────────────
  const spec_g500 = await prisma.packagingSpec.upsert({
    where: { id: 1 },
    update: {},
    create: { productId: gopchang.id, name: '500g 소포장', gramPerPack: 500 },
  });

  const spec_g1000 = await prisma.packagingSpec.upsert({
    where: { id: 2 },
    update: {},
    create: { productId: gopchang.id, name: '1kg 포장', gramPerPack: 1000 },
  });

  const spec_mak500 = await prisma.packagingSpec.upsert({
    where: { id: 3 },
    update: {},
    create: { productId: makchang.id, name: '500g 소포장', gramPerPack: 500 },
  });

  const spec_dae1000 = await prisma.packagingSpec.upsert({
    where: { id: 4 },
    update: {},
    create: { productId: daechang.id, name: '1kg 포장', gramPerPack: 1000 },
  });

  console.log('✓ Packaging specs created');

  // ── 2026년 2월 생산 계획 + 결과 ────────────────────────
  // 결과까지 같이 생성할 계획 목록
  const plansWithResults = [
    {
      plan: {
        productionDate: new Date('2026-02-03'),
        productId: gopchang.id,
        packagingSpecId: spec_g500.id,
        targetAmountGram: 50000,
        memo: '납품용',
        createdById: admin.id,
      },
      result: { boxCount: 8, packsPerBox: 12, remainingPackCount: 2 },
      resultCreatedById: worker1.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-04'),
        productId: gopchang.id,
        packagingSpecId: spec_g1000.id,
        targetAmountGram: 80000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 6, packsPerBox: 12, remainingPackCount: 4 },
      resultCreatedById: worker1.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-05'),
        productId: makchang.id,
        packagingSpecId: spec_mak500.id,
        targetAmountGram: 40000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 7, packsPerBox: 10, remainingPackCount: 5 },
      resultCreatedById: worker2.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-06'),
        productId: daechang.id,
        packagingSpecId: spec_dae1000.id,
        targetAmountGram: 60000,
        memo: '특별주문',
        createdById: admin.id,
      },
      result: { boxCount: 5, packsPerBox: 10, remainingPackCount: 8 },
      resultCreatedById: worker2.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-10'),
        productId: gopchang.id,
        packagingSpecId: spec_g500.id,
        targetAmountGram: 55000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 9, packsPerBox: 12, remainingPackCount: 0 },
      resultCreatedById: worker1.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-11'),
        productId: makchang.id,
        packagingSpecId: spec_mak500.id,
        targetAmountGram: 35000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 6, packsPerBox: 11, remainingPackCount: 3 },
      resultCreatedById: worker2.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-12'),
        productId: gopchang.id,
        packagingSpecId: spec_g1000.id,
        targetAmountGram: 90000,
        memo: '대량주문',
        createdById: admin.id,
      },
      result: { boxCount: 7, packsPerBox: 12, remainingPackCount: 1 },
      resultCreatedById: worker1.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-13'),
        productId: daechang.id,
        packagingSpecId: spec_dae1000.id,
        targetAmountGram: 70000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 6, packsPerBox: 11, remainingPackCount: 0 },
      resultCreatedById: worker2.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-17'),
        productId: gopchang.id,
        packagingSpecId: spec_g500.id,
        targetAmountGram: 48000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 8, packsPerBox: 11, remainingPackCount: 4 },
      resultCreatedById: worker1.id,
    },
    {
      plan: {
        productionDate: new Date('2026-02-18'),
        productId: makchang.id,
        packagingSpecId: spec_mak500.id,
        targetAmountGram: 42000,
        memo: null,
        createdById: admin.id,
      },
      result: { boxCount: 7, packsPerBox: 11, remainingPackCount: 2 },
      resultCreatedById: worker2.id,
    },
  ];

  // 결과 없는 계획 (이번 주)
  const plansOnly = [
    {
      productionDate: new Date('2026-02-23'),
      productId: gopchang.id,
      packagingSpecId: spec_g1000.id,
      targetAmountGram: 85000,
      memo: null,
      createdById: admin.id,
    },
    {
      productionDate: new Date('2026-02-24'),
      productId: makchang.id,
      packagingSpecId: spec_mak500.id,
      targetAmountGram: 38000,
      memo: null,
      createdById: admin.id,
    },
    {
      productionDate: new Date('2026-02-25'),
      productId: daechang.id,
      packagingSpecId: spec_dae1000.id,
      targetAmountGram: 65000,
      memo: '월말 납품',
      createdById: admin.id,
    },
  ];

  for (const { plan, result, resultCreatedById } of plansWithResults) {
    const createdPlan = await prisma.productionPlan.create({ data: plan });

    const gramPerPack =
      [spec_g500, spec_g1000, spec_mak500, spec_dae1000].find(
        (s) => s.id === plan.packagingSpecId,
      )?.gramPerPack ?? 500;

    const totalPackCount =
      result.boxCount * result.packsPerBox + result.remainingPackCount;
    const totalAmountGram = totalPackCount * gramPerPack;

    await prisma.productionResult.create({
      data: {
        productionPlanId: createdPlan.id,
        boxCount: result.boxCount,
        packsPerBox: result.packsPerBox,
        remainingPackCount: result.remainingPackCount,
        totalPackCount,
        totalAmountGram,
        createdById: resultCreatedById,
      },
    });

    console.log(
      `  ✓ ${plan.productionDate.toISOString().slice(0, 10)} 계획 + 결과 (총 ${totalAmountGram.toLocaleString()}g)`,
    );
  }

  for (const plan of plansOnly) {
    await prisma.productionPlan.create({ data: plan });
    console.log(
      `  ✓ ${plan.productionDate.toISOString().slice(0, 10)} 계획만 (결과 미입력)`,
    );
  }

  console.log('\n✓ 2월 시드 데이터 삽입 완료');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
