import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AppointmentStatus,
  Gender,
  PrismaClient,
  UserRole,
} from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // -----------------------------------------------------
  // 1. Clear existing data
  // -----------------------------------------------------

  await prisma.appointment.deleteMany();
  await prisma.treatmentSession.deleteMany();
  await prisma.package.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinic.deleteMany();

  // -----------------------------------------------------
  // 2. Create clinic
  // -----------------------------------------------------

  const clinic = await prisma.clinic.create({
    data: {
      name: "Glow Beauty Clinic",
      phone: "081234567890",
      address: "Jl. Kemang Raya No. 25, Jakarta Selatan",
    },
  });

  // -----------------------------------------------------
  // 3. Create users
  // -----------------------------------------------------

  await prisma.user.createMany({
    data: [
      {
        clinicId: clinic.id,
        name: "Grand",
        email: "grand@glowbeauty.test",
        role: UserRole.OWNER,
      },
      {
        clinicId: clinic.id,
        name: "Sarah",
        email: "sarah@glowbeauty.test",
        role: UserRole.OPERATOR,
      },
    ],
  });

  // -----------------------------------------------------
  // 4. Create services
  // -----------------------------------------------------

  const facial = await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name: "Premium Facial",
      description: "Deep cleansing facial treatment",
      defaultPrice: 350000,
    },
  });

  const acne = await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name: "Acne Treatment",
      description: "Treatment for acne-prone skin",
      defaultPrice: 450000,
    },
  });

  const peel = await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name: "Chemical Peel",
      description: "Professional chemical peeling treatment",
      defaultPrice: 600000,
    },
  });

  const laser = await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name: "Laser Treatment",
      description: "Advanced laser skin treatment",
      defaultPrice: 1200000,
    },
  });

  const weightLoss = await prisma.service.create({
    data: {
      clinicId: clinic.id,
      name: "Weight Loss Program",
      description: "Doctor supervised weight loss program",
      defaultPrice: 2500000,
    },
  });

  // -----------------------------------------------------
  // 5. Create customers
  // -----------------------------------------------------

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Jessica Tan",
        phone: "081234567801",
        dateOfBirth: new Date("1997-04-12"),
        gender: Gender.FEMALE,
        notes: "Sensitive skin. Avoid strong exfoliation.",
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Maria Santoso",
        phone: "081234567802",
        dateOfBirth: new Date("1995-08-21"),
        gender: Gender.FEMALE,
        notes: "Acne-prone skin.",
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Amanda Wijaya",
        phone: "081234567803",
        dateOfBirth: new Date("1999-01-15"),
        gender: Gender.FEMALE,
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Kevin Hartono",
        phone: "081234567804",
        dateOfBirth: new Date("1994-11-03"),
        gender: Gender.MALE,
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Clara Lim",
        phone: "081234567805",
        dateOfBirth: new Date("1998-06-30"),
        gender: Gender.FEMALE,
        notes: "Interested in skin brightening treatments.",
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Daniel Setiawan",
        phone: "081234567806",
        dateOfBirth: new Date("1992-02-17"),
        gender: Gender.MALE,
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Samantha Lee",
        phone: "081234567807",
        dateOfBirth: new Date("1996-09-10"),
        gender: Gender.FEMALE,
      },
    }),

    prisma.customer.create({
      data: {
        clinicId: clinic.id,
        name: "Rachel Gunawan",
        phone: "081234567808",
        dateOfBirth: new Date("2000-12-05"),
        gender: Gender.FEMALE,
        notes: "First-time customer.",
      },
    }),
  ]);

  const [jessica, maria, amanda, kevin, clara, daniel, samantha, rachel] =
    customers;

  // -----------------------------------------------------
  // 6. Create packages
  // -----------------------------------------------------

  const jessicaPackage = await prisma.package.create({
    data: {
      customerId: jessica.id,
      serviceId: facial.id,
      totalSessions: 5,
      price: 1500000,
      purchaseDate: new Date("2026-08-01"),
    },
  });

  const mariaPackage = await prisma.package.create({
    data: {
      customerId: maria.id,
      serviceId: acne.id,
      totalSessions: 6,
      price: 2400000,
      purchaseDate: new Date("2026-08-05"),
    },
  });

  const amandaPackage = await prisma.package.create({
    data: {
      customerId: amanda.id,
      serviceId: laser.id,
      totalSessions: 4,
      price: 4200000,
      purchaseDate: new Date("2026-08-10"),
    },
  });

  const kevinPackage = await prisma.package.create({
    data: {
      customerId: kevin.id,
      serviceId: weightLoss.id,
      totalSessions: 8,
      price: 18000000,
      purchaseDate: new Date("2026-07-15"),
    },
  });

  const claraPackage = await prisma.package.create({
    data: {
      customerId: clara.id,
      serviceId: peel.id,
      totalSessions: 3,
      price: 1500000,
      purchaseDate: new Date("2026-08-20"),
    },
  });

  const danielPackage = await prisma.package.create({
    data: {
      customerId: daniel.id,
      serviceId: facial.id,
      totalSessions: 5,
      price: 1500000,
      purchaseDate: new Date("2026-07-20"),
    },
  });

  const samanthaPackage = await prisma.package.create({
    data: {
      customerId: samantha.id,
      serviceId: laser.id,
      totalSessions: 4,
      price: 4200000,
      purchaseDate: new Date("2026-07-01"),
    },
  });

  const rachelPackage = await prisma.package.create({
    data: {
      customerId: rachel.id,
      serviceId: facial.id,
      totalSessions: 3,
      price: 900000,
      purchaseDate: new Date("2026-09-01"),
    },
  });

  // -----------------------------------------------------
  // 7. Create treatment sessions
  // -----------------------------------------------------

  // Jessica: 3 / 5 completed
  await prisma.treatmentSession.createMany({
    data: [
      {
        customerId: jessica.id,
        packageId: jessicaPackage.id,
        sessionNumber: 1,
        treatmentDate: new Date("2026-08-01"),
        notes: "Deep cleansing facial.",
      },
      {
        customerId: jessica.id,
        packageId: jessicaPackage.id,
        sessionNumber: 2,
        treatmentDate: new Date("2026-08-15"),
        notes: "Skin condition improved.",
      },
      {
        customerId: jessica.id,
        packageId: jessicaPackage.id,
        sessionNumber: 3,
        treatmentDate: new Date("2026-08-29"),
        notes: "Customer satisfied with result.",
      },
    ],
  });

  // Maria: 4 / 6 completed
  await prisma.treatmentSession.createMany({
    data: [
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        sessionNumber: 1,
        treatmentDate: new Date("2026-08-05"),
        notes: "Initial acne assessment.",
      },
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        sessionNumber: 2,
        treatmentDate: new Date("2026-08-12"),
        notes: "Inflammation reduced.",
      },
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        sessionNumber: 3,
        treatmentDate: new Date("2026-08-19"),
        notes: "Continue treatment.",
      },
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        sessionNumber: 4,
        treatmentDate: new Date("2026-08-26"),
        notes: "Good progress.",
      },
    ],
  });

  // Amanda: 2 / 4 completed
  await prisma.treatmentSession.createMany({
    data: [
      {
        customerId: amanda.id,
        packageId: amandaPackage.id,
        sessionNumber: 1,
        treatmentDate: new Date("2026-08-10"),
        notes: "Laser treatment session.",
      },
      {
        customerId: amanda.id,
        packageId: amandaPackage.id,
        sessionNumber: 2,
        treatmentDate: new Date("2026-08-24"),
        notes: "No complications.",
      },
    ],
  });

  // Kevin: 5 / 8 completed
  await prisma.treatmentSession.createMany({
    data: [
      {
        customerId: kevin.id,
        packageId: kevinPackage.id,
        sessionNumber: 1,
        treatmentDate: new Date("2026-07-15"),
        notes: "Initial consultation.",
      },
      {
        customerId: kevin.id,
        packageId: kevinPackage.id,
        sessionNumber: 2,
        treatmentDate: new Date("2026-07-22"),
        notes: "Diet plan discussed.",
      },
      {
        customerId: kevin.id,
        packageId: kevinPackage.id,
        sessionNumber: 3,
        treatmentDate: new Date("2026-07-29"),
        notes: "Weight progress recorded.",
      },
      {
        customerId: kevin.id,
        packageId: kevinPackage.id,
        sessionNumber: 4,
        treatmentDate: new Date("2026-08-05"),
        notes: "Continue diet plan.",
      },
      {
        customerId: kevin.id,
        packageId: kevinPackage.id,
        sessionNumber: 5,
        treatmentDate: new Date("2026-08-12"),
        notes: "Good progress.",
      },
    ],
  });

  // Clara: 1 / 3 completed
  await prisma.treatmentSession.create({
    data: {
      customerId: clara.id,
      packageId: claraPackage.id,
      sessionNumber: 1,
      treatmentDate: new Date("2026-08-20"),
      notes: "First chemical peel.",
    },
  });

  // Daniel: 5 / 5 completed
  await prisma.treatmentSession.createMany({
    data: Array.from({ length: 5 }, (_, index) => {
      const treatmentDate = new Date(2026, 6, 20);

      treatmentDate.setDate(treatmentDate.getDate() + index * 7);
      return {
        customerId: daniel.id,
        packageId: danielPackage.id,
        sessionNumber: index + 1,
        treatmentDate,
        notes: `Facial session ${index + 1}.`,
      };
    }),
  });

  // Samantha: 3 / 4 completed
  await prisma.treatmentSession.createMany({
    data: [
      {
        customerId: samantha.id,
        packageId: samanthaPackage.id,
        sessionNumber: 1,
        treatmentDate: new Date("2026-07-01"),
        notes: "Laser treatment.",
      },
      {
        customerId: samantha.id,
        packageId: samanthaPackage.id,
        sessionNumber: 2,
        treatmentDate: new Date("2026-07-15"),
        notes: "Skin responding well.",
      },
      {
        customerId: samantha.id,
        packageId: samanthaPackage.id,
        sessionNumber: 3,
        treatmentDate: new Date("2026-08-01"),
        notes: "Good result.",
      },
    ],
  });

  // Rachel: 0 / 3 completed
  // This gives us a brand-new package.

  // -----------------------------------------------------
  // 8. Create appointments
  // -----------------------------------------------------

  await prisma.appointment.createMany({
    data: [
      // Jessica - upcoming
      {
        customerId: jessica.id,
        packageId: jessicaPackage.id,
        scheduledAt: new Date("2026-09-12T09:00:00"),
        status: AppointmentStatus.CONFIRMED,
        notes: "Session 4.",
      },

      // Maria - upcoming
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        scheduledAt: new Date("2026-09-12T10:30:00"),
        status: AppointmentStatus.PENDING,
        notes: "Session 5.",
      },

      // Amanda - upcoming
      {
        customerId: amanda.id,
        packageId: amandaPackage.id,
        scheduledAt: new Date("2026-09-13T13:00:00"),
        status: AppointmentStatus.CONFIRMED,
        notes: "Session 3.",
      },

      // Kevin - NO upcoming appointment
      // This should appear in Follow-ups.

      // Clara - NO upcoming appointment
      // This should appear in Follow-ups.

      // Daniel - completed package
      {
        customerId: daniel.id,
        packageId: danielPackage.id,
        scheduledAt: new Date("2026-08-20T15:00:00"),
        status: AppointmentStatus.COMPLETED,
        notes: "Final session.",
      },

      // Samantha - no upcoming appointment
      // Should appear in Follow-ups.

      // Rachel - upcoming
      {
        customerId: rachel.id,
        packageId: rachelPackage.id,
        scheduledAt: new Date("2026-09-14T11:00:00"),
        status: AppointmentStatus.PENDING,
        notes: "Initial facial session.",
      },

      // Old cancelled appointment
      {
        customerId: maria.id,
        packageId: mariaPackage.id,
        scheduledAt: new Date("2026-09-05T10:00:00"),
        status: AppointmentStatus.CANCELLED,
        notes: "Customer cancelled.",
      },
    ],
  });

  // -----------------------------------------------------
  // 9. Summary
  // -----------------------------------------------------

  console.log("");
  console.log("✅ Seed completed!");
  console.log("");
  console.log(`Clinic: ${clinic.name}`);
  console.log("Users: 2");
  console.log("Customers: 8");
  console.log("Services: 5");
  console.log("Packages: 8");
  console.log("");
  console.log("Test users:");
  console.log("OWNER    → grand@glowbeauty.test");
  console.log("OPERATOR → sarah@glowbeauty.test");
  console.log("");
  console.log("🌱 Database is ready.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
