import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Fungsi untuk seed role dan user
async function seedUsers() {
  console.log('Memulai seeding untuk role dan user...');
  
  // Membuat role
  const roles = [
    { name: 'admin' },
    { name: 'guru' },
    { name: 'staff' },
    { name: 'wali_murid' }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    });
  }

  console.log('Role seeding selesai');

  // Membuat admin default
  const adminPassword = await hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: 1, // admin role
      avatar: 'avatar/default.png',
    },
  });
  console.log('Admin default berhasil dibuat');

  // Membuat beberapa user acak
  for (let i = 0; i < 10; i++) {
    const roleId = faker.helpers.arrayElement([1, 2, 3, 4]);
    const password = await hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: password,
        roleId: roleId,
        avatar: `avatar/user-${i + 1}.png`,
      },
    });
  }

  console.log('10 user acak berhasil dibuat');
  console.log('User seeding selesai');
}

// Fungsi untuk seed student
async function seedStudents() {
  console.log('Memulai seeding untuk student...');
  
  // Membuat data siswa
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
  console.log('200 student berhasil dibuat');
  console.log('Student seeding selesai');
}

async function main() {
  // Memeriksa argumen command line
  const args = process.argv.slice(2);
  
  console.log('Argumen yang diterima:', args);
  
  if (args.includes('--users')) {
    console.log('Menjalankan seed khusus untuk user');
    await seedUsers();
  } else if (args.includes('--students')) {
    console.log('Menjalankan seed khusus untuk student');
    await seedStudents();
  } else {
    console.log('Menjalankan semua seed');
    await seedUsers();
    await seedStudents();
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