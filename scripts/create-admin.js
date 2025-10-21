#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <password>
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdmin(email, password) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      console.log("✅ User updated to admin:", updatedUser);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("✅ Admin user created successfully:", adminUser);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log("Usage: node scripts/create-admin.js <email> <password>");
  console.log(
    "Example: node scripts/create-admin.js admin@example.com mypassword123"
  );
  process.exit(1);
}

const [email, password] = args;
createAdmin(email, password);
