import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required for seeding");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@whobrey.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "dev-admin-password";
  const adminHash = hashSync(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Studio admin",
      role: "admin",
      emailVerified: new Date(),
      passwordHash: adminHash,
    },
    update: {
      role: "admin",
      passwordHash: adminHash,
    },
  });

  const rawClientEmails = process.env.SEED_CLIENT_EMAILS ?? process.env.SEED_CLIENT_EMAIL ?? "client@whobrey.local";
  const clientEmails = rawClientEmails
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "dev-client-password";
  const clientHash = hashSync(clientPassword, 12);

  for (let i = 0; i < clientEmails.length; i++) {
    const clientEmail = clientEmails[i];
    await prisma.user.upsert({
      where: { email: clientEmail },
      create: {
        email: clientEmail,
        name: `Client ${i + 1}`,
        role: "client",
        emailVerified: new Date(),
        passwordHash: clientHash,
      },
      update: {
        role: "client",
        passwordHash: clientHash,
      },
    });
  }

  const serviceDefaults = [
    "Logo",
    "Brand identity",
    "Vehicle wrap / decal",
    "Social media graphics",
    "Print design",
    "Website graphics",
  ];
  for (let i = 0; i < serviceDefaults.length; i++) {
    const name = serviceDefaults[i];
    await prisma.serviceType.upsert({
      where: { name },
      create: {
        name,
        sortOrder: i * 10,
        isActive: true,
      },
      update: {
        sortOrder: i * 10,
      },
    });
  }

  console.log("Seeded admin:", adminEmail);
  console.log("Seeded clients:", clientEmails.join(", "));
  console.log("Seeded service types:", serviceDefaults.join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
