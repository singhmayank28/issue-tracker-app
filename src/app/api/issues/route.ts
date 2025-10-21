import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createIssueSchema } from "@/lib/validations";
import { withPermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";

// GET /api/issues - List all issues with pagination and filtering
export const GET = withPermission(
  "read_issue",
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination parameters
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = Math.min(
        parseInt(searchParams.get("page_size") || "10"),
        50
      ); // Max 50 items per page
      const skip = (page - 1) * pageSize;

      // Filter parameters
      const status = searchParams.get("status"); // 'open', 'closed', or null for all
      // Note: Search is handled on the frontend

      // Build where clause
      const where: any = {};

      // Status filter
      if (
        status &&
        (status.toUpperCase() === "OPEN" || status.toUpperCase() === "CLOSED")
      ) {
        where.status = status.toUpperCase();
      }

      // Note: Search is handled on the frontend for simplicity

      // Get total count for pagination
      const totalCount = await prisma.issue.count({ where });

      // Get paginated issues
      const issues = await prisma.issue.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return NextResponse.json({
        issues,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        filters: {
          status: status || "all",
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

// POST /api/issues - Create new issue
export const POST = withPermission(
  "create_issue",
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();

      // Validate input - this will throw ZodError if invalid, which handleApiError will catch
      const { title, description } = createIssueSchema.parse(body);

      // Create the issue
      const issue = await prisma.issue.create({
        data: {
          title,
          description,
          authorId: user.userId,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      return NextResponse.json(issue, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
