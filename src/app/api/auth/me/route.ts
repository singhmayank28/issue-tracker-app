import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/permissions";

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Fetch fresh user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "User not found", message: "User account no longer exists" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user info error:", error);

    return NextResponse.json(
      { error: "Internal server error", message: "Something went wrong" },
      { status: 500 }
    );
  }
});
