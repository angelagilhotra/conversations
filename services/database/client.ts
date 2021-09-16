import { PrismaClient, Prisma } from "@prisma/client";
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { level: "warn", emit: "event" },
    { level: "info", emit: "event" },
    { level: "error", emit: "event" },
    { level: "query", emit: "event" },
  ],
};
let prisma: PrismaClient;
prisma = new PrismaClient(prismaClientOptions);

prisma.$on("beforeExit", async () => {
  // PrismaClient still available
  console.log("shutting down database connection");
});

export default prisma;
