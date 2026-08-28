import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

//Same connection setup as src/prisma.service.ts.
//Prisma 7 needs an adapter, it will not read DATABASE_URL on its own.
const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    //Trainers and learners must belong to an organisation, so make one first.
    //upsert = create it if missing, leave it alone if it already exists.
    const org = await prisma.organisation.upsert({
        where: { name: 'Acme Corp' },
        update: {},
        create: { name: 'Acme Corp' },
    });
    console.log(`Organisation ready: ${org.name} (id ${org.id})`);

    //Every test account uses the same password so you only remember one
    const passwordHash = await bcrypt.hash('Password1!', 10);

    const people = [
        {
            username: 'admin',
            email: 'admin@test.com',
            firstName: 'Ada',
            lastName: 'Admin',
            role: Role.GLOBAL_ADMIN,
            organisationId: null, //global admins
        },
        {
            username: 'trainer',
            email: 'trainer@test.com',
            firstName: 'Tom',
            lastName: 'Trainer',
            role: Role.TRAINER,
            organisationId: org.id,
        },
        {
            username: 'learner',
            email: 'learner@test.com',
            firstName: 'Lena',
            lastName: 'Learner',
            role: Role.LEARNER,
            organisationId: org.id,
        },
    ];

    for (const person of people) {
        const user = await prisma.user.upsert({
            where: { email: person.email },
            update: { passwordHash }, //resets the password if you run this again
            create: { ...person, passwordHash },
        });
        console.log(`${user.role.padEnd(12)} ${user.email}`);
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });