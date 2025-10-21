import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, canDeleteComment } from "@/lib/permissions";

// DELETE /api/comments/[id] - Delete a specific comment with permission checks
export const DELETE = withAuth(
  async (
    request: NextRequest,
    user,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      // First, check if the comment exists
      const existingComment = await prisma.comment.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!existingComment) {
        return NextResponse.json(
          { error: "Not Found", message: "Comment not found" },
          { status: 404 }
        );
      }

      // Check if user can delete this comment
      const canDelete = await canDeleteComment(user, id);
      if (!canDelete) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "You don't have permission to delete this comment",
          },
          { status: 403 }
        );
      }

      // Delete the comment
      await prisma.comment.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Comment deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { error: "Internal Server Error", message: "Failed to delete comment" },
        { status: 500 }
      );
    }
  }
);
