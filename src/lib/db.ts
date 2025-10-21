import { PrismaClient } from "@prisma/client";

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a single instance of PrismaClient
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

// In development, store the client on the global object to prevent
// multiple instances during hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Database connection helper functions
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log("Disconnected from database successfully");
  } catch (error) {
    console.error("Failed to disconnect from database:", error);
    throw error;
  }
}
