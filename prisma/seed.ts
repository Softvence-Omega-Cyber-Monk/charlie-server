// prisma/seed.ts
import { PrismaClient, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create teachers
  const teacher1 = await prisma.teacher.upsert({
    where: { email: 'teacher@tdaacademy.com' },
    update: {},
    create: {
      email: 'teacher@tdaacademy.com',
      name: 'Mr. Campbell',
      passwordHash: await bcrypt.hash('password123', 10),
    },
  });

  // Create classes
  const preRally = await prisma.class.upsert({
    where: { id: 'prerrally-class-001' },
    update: {},
    create: {
      id: 'prerrally-class-001',
      name: 'Pre-Rally',
      site: 'Campbell Site',
      room: 'Room 302',
      icon: 'graduation',
      teacherId: teacher1.id,
    },
  });

  const rally1 = await prisma.class.upsert({
    where: { id: 'rally1-class-001' },
    update: {},
    create: {
      id: 'rally1-class-001',
      name: 'Rally 1',
      site: 'Campbell Site',
      room: 'Wing B',
      icon: 'academic',
      teacherId: teacher1.id,
    },
  });

  const rally2 = await prisma.class.upsert({
    where: { id: 'rally2-class-001' },
    update: {},
    create: {
      id: 'rally2-class-001',
      name: 'Rally 2',
      site: 'Campbell Site',
      room: null,
      icon: 'academic',
      teacherId: teacher1.id,
    },
  });

  // Create schedules for Rally 1
  const mondaySched = await prisma.schedule.upsert({
    where: { id: 'sched-rally1-mon' },
    update: {},
    create: {
      id: 'sched-rally1-mon',
      classId: rally1.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '16:05',
      endTime: '17:00',
    },
  });

  await prisma.schedule.upsert({
    where: { id: 'sched-rally1-fri' },
    update: {},
    create: {
      id: 'sched-rally1-fri',
      classId: rally1.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: '16:05',
      endTime: '17:00',
    },
  });

  await prisma.schedule.upsert({
    where: { id: 'sched-rally1-sat' },
    update: {},
    create: {
      id: 'sched-rally1-sat',
      classId: rally1.id,
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: '10:05',
      endTime: '11:00',
    },
  });

  // Create students
  const john = await prisma.student.upsert({
    where: { studentCode: '2023-0041' },
    update: {},
    create: { studentCode: '2023-0041', name: 'John Doe' },
  });

  const jane = await prisma.student.upsert({
    where: { studentCode: '2023-0089' },
    update: {},
    create: { studentCode: '2023-0089', name: 'Jane Smith' },
  });

  const michael = await prisma.student.upsert({
    where: { studentCode: '2023-0122' },
    update: {},
    create: { studentCode: '2023-0122', name: 'Michael Brown' },
  });

  const alexandria = await prisma.student.upsert({
    where: { studentCode: '8829-S' },
    update: {},
    create: { studentCode: '8829-S', name: 'Alexandria Adams' },
  });

  const benjamin = await prisma.student.upsert({
    where: { studentCode: '3194-S' },
    update: {},
    create: { studentCode: '3194-S', name: 'Benjamin Miller' },
  });

  const chloe = await prisma.student.upsert({
    where: { studentCode: '9902-S' },
    update: {},
    create: { studentCode: '9902-S', name: 'Chloe Henderson' },
  });

  const daniel = await prisma.student.upsert({
    where: { studentCode: '4410-S' },
    update: {},
    create: { studentCode: '4410-S', name: 'Daniel Wright' },
  });

  // Enroll students in Rally 1
  for (const student of [john, jane, michael]) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId: rally1.id } },
      update: {},
      create: { studentId: student.id, classId: rally1.id },
    });
  }

  // Enroll students in Pre-Rally
  for (const student of [alexandria, benjamin, chloe, daniel]) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId: preRally.id } },
      update: {},
      create: { studentId: student.id, classId: preRally.id },
    });
  }

  console.log('✅ Seed complete!');
  console.log(`\n📋 Teacher login:\n  email: teacher@tdaacademy.com\n  password: password123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
