import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root123',
  database: 'phishing_simulator',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting Prisma database feasibility test...');

  const moduleRecord = await prisma.module.create({
    data: {
      title: 'Database Feasibility Test Module',
      description: 'Temporary module for Prisma/MySQL testing',
    },
  });

  console.log('Created module:', moduleRecord);

  const scenarioRecord = await prisma.scenario.create({
    data: {
      moduleId: moduleRecord.id,
      title: 'Test Scenario',
      content: 'This is a test phishing scenario.',
    },
  });

  console.log('Created scenario:', scenarioRecord);

  const choiceRecord = await prisma.scenarioChoice.create({
    data: {
      scenarioId: scenarioRecord.id,
      text: 'Report',
      isCorrect: true,
    },
  });

  console.log('Created choice:', choiceRecord);


  //--Demo Users---
  const learnerPasswordHash = await bcrypt.hash('Password1!', 10);
  const adminPasswordHash = await bcrypt.hash('Password1!', 10);

  //Learner test user
  const learnerUser = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: learnerPasswordHash,
      role: 'learner',
    },
    create: {
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: learnerPasswordHash,
      role: 'learner',
    },
  });

  console.log('Created learner user:', learnerUser);

  //Admin test user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  console.log('Created admin user:', adminUser);

  console.log('Users for demon created successfully.');

  const attemptRecord = await prisma.attempt.create({
    data: {
      userId: learnerUser.id,
      scenarioId: scenarioRecord.id,
      choiceId: choiceRecord.id,
      isCorrect: true,
    },
  });

  console.log('Created attempt:', attemptRecord);

  const resultRecord = await prisma.results.create({
    data: {
      userId: learnerUser.id,
      moduleId: moduleRecord.id,
      score: 1,
    },
  });

  console.log('Created result:', resultRecord);
  console.log('Database feasibility test completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error: there is an issue, check prisma service, env file, mysql username and password are all correct', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });