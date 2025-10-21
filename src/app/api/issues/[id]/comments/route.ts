import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations";
import { withAuth, withPermission } from "@/lib/permissions";
import { handleApiError, ErrorResponses } from "@/lib/errors";
import { broadcastToIssue } from "@/lib/notifications";

// GET /api/issues/[id]/comments - Get all comments for an issue
export const GET = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: issueId } = await params;

      // First check if the issue exists
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { id: true },
      });

      if (!issue) {
        return ErrorResponses.notFound("Issue");
      }

      // Get all comments for the issue
      const comments = await prisma.comment.findMany({
        where: { issueId },
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
      });

      return NextResponse.json(comments);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

// POST /api/issues/[id]/comments - Create a new comment on an issue
export const POST = withPermission(
  "create_comment",
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: issueId } = await params;

      // First check if the issue exists
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { id: true },
      });

      if (!issue) {
        return ErrorResponses.notFound("Issue");
      }

      const body = await request.json();

      // Validate input - this will throw ZodError if invalid, which handleApiError will catch
      const { content } = createCommentSchema.parse(body);

      // Create the comment
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: user.userId,
          issueId,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Broadcast real-time notification
      broadcastToIssue(issueId, {
        type: "comment_added",
        message: `New comment added by ${comment.author.email}`,
        data: {
          comment,
          issueId,
        },
      });

      return NextResponse.json(comment, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
