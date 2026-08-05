// packages/db/prisma/seed.ts
import { db } from "../src/index";

async function main() {
  console.log("🌱 Seeding database with mock poll...");

  // 1. Upsert a host user
  const host = await db.user.upsert({
    where: { email: "alex.host@example.com" },
    update: {},
    create: {
      email: "alex.host@example.com",
      name: "Alex Host",
      username: "alexhost",
    },
  });

  // 2. Upsert a poll with proposed time slots
  const poll = await db.poll.upsert({
    where: { slug: "quarterly-planning-sync" },
    update: {},
    create: {
      title: "Quarterly Planning Sync",
      description: "Let's align on team goals and project deliverables for Q3.",
      slug: "quarterly-planning-sync",
      hostId: host.id,
      slots: {
        create: [
          {
            startTime: new Date("2026-08-10T09:00:00.000Z"),
            endTime: new Date("2026-08-10T10:00:00.000Z"),
          },
          {
            startTime: new Date("2026-08-10T14:00:00.000Z"),
            endTime: new Date("2026-08-10T15:00:00.000Z"),
          },
          {
            startTime: new Date("2026-08-11T11:00:00.000Z"),
            endTime: new Date("2026-08-11T12:00:00.000Z"),
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded poll successfully! Slug: ${poll.slug}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
