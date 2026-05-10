import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root1234',
  database: 'uni',
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

  const choiceRecord = await prisma.scenariochoice.create({
    data: {
      scenarioId: scenarioRecord.id,
      text: 'Report',
      isCorrect: true,
    },
  });

  console.log('Created choice:', choiceRecord);

  const userRecord = await prisma.user.create({
    data: {
      username: `testuser`,
      email: `testuser`,
      passwordHash: 'testpassword123',
      role: 'learner',
    },
  });

  console.log('Created user:', userRecord);

  const attemptRecord = await prisma.attempt.create({
    data: {
      userId: userRecord.id,
      scenarioId: scenarioRecord.id,
      choiceId: choiceRecord.id,
      isCorrect: true,
    },
  });

  console.log('Created attempt:', attemptRecord);

  const resultRecord = await prisma.results.create({
    data: {
      userId: userRecord.id,
      moduleId: moduleRecord.id,
      score: 1,
    },
  });

  console.log('Created result:', resultRecord);
  console.log('Database feasibility test completed successfully.');
}

main()
  .catch((e) => {
    console.error(
      'Error: there is an issue, check prisma service, env file, mysql username and password are all correct',
      e,
    );
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
