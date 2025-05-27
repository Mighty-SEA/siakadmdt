import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 200; i++) {
    await prisma.student.create({
      data: {
        name: faker.person.fullName(),
        nis: faker.string.numeric({ length: 8 }),
        birth_date: faker.date.birthdate({ min: 2005, max: 2015, mode: 'year' }),
        gender: faker.helpers.arrayElement(['L', 'P']),
        is_alumni: faker.datatype.boolean(),
        nik: faker.string.numeric({ length: 16 }),
        kk: faker.string.numeric({ length: 16 }),
        father_name: faker.person.fullName({ sex: 'male' }),
        mother_name: faker.person.fullName({ sex: 'female' }),
        father_job: faker.person.jobTitle(),
        mother_job: faker.person.jobTitle(),
        origin_school: faker.company.name(),
        nisn: faker.string.numeric({ length: 10 }),
        birth_place: faker.location.city(),
        qr_token: faker.string.alphanumeric({ length: 16 }),
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seeding selesai!');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 