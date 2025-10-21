import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateIssueSchema } from "@/lib/validations";
import {
  withAuth,
  canEditIssue,
  canDeleteIssue,
  canCloseIssue,
} from "@/lib/permissions";
import { handleApiError, ErrorResponses } from "@/lib/errors";

// GET /api/issues/[id] - Get specific issue
export const GET = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      const issue = await prisma.issue.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!issue) {
        return ErrorResponses.notFound("Issue");
      }

      return NextResponse.json(issue);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

// PUT /api/issues/[id] - Update issue with ownership checks
export const PUT = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      // First, check if the issue exists
      const existingIssue = await prisma.issue.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          status: true,
        },
      });

      if (!existingIssue) {
        return ErrorResponses.notFound("Issue");
      }

      // Check if user can edit this issue
      const canEdit = await canEditIssue(user, id);
      if (!canEdit) {
        return ErrorResponses.forbidden();
      }

      const body = await request.json();

      // Validate input - this will throw ZodError if invalid, which handleApiError will catch
      const updateData = updateIssueSchema.parse(body);

      // Check if user can close issues (only admins)
      if (updateData.status === "CLOSED") {
        const canClose = await canCloseIssue(user, id);
        if (!canClose) {
          return ErrorResponses.forbidden();
        }
      }

      // Update the issue
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return NextResponse.json(updatedIssue);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

// DELETE /api/issues/[id] - Delete issue with permission checks
export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      // First, check if the issue exists
      const existingIssue = await prisma.issue.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!existingIssue) {
        return ErrorResponses.notFound("Issue");
      }

      // Check if user can delete this issue
      const canDelete = await canDeleteIssue(user, id);
      if (!canDelete) {
        return ErrorResponses.forbidden();
      }

      // Delete the issue (comments will be deleted due to cascade)
      await prisma.issue.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Issue deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
