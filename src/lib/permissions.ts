import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest, JWTPayload } from "@/lib/auth";

// Permission types
export type Permission =
  | "read_issue"
  | "create_issue"
  | "edit_issue"
  | "delete_issue"
  | "close_issue"
  | "create_comment"
  | "edit_comment"
  | "delete_comment";

// Role definitions
export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Permission matrix - defines what each role can do
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.USER]: [
    "read_issue",
    "create_issue",
    "edit_issue",
    "delete_issue",
    "create_comment",
    "edit_comment",
    "delete_comment",
  ],
  [ROLES.ADMIN]: [
    "read_issue",
    "create_issue",
    "edit_issue",
    "delete_issue",
    "close_issue",
    "create_comment",
    "edit_comment",
    "delete_comment",
  ],
};

// Authentication middleware
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  const currentUser = getCurrentUserFromRequest(request);

  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "User account no longer exists" },
      { status: 401 }
    );
  }

  // Update the user object with fresh data from database
  const updatedUser: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return { user: updatedUser };
}

// Role-based permission checking
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

// Check if user has required permission
export function requirePermission(
  user: JWTPayload,
  permission: Permission
): boolean {
  return hasPermission(user.role as Role, permission);
}

// Resource ownership validation
export async function isIssueOwner(
  userId: string,
  issueId: string
): Promise<boolean> {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { authorId: true },
  });

  return issue?.authorId === userId;
}

export async function isCommentOwner(
  userId: string,
  commentId: string
): Promise<boolean> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  return comment?.authorId === userId;
}

// Combined permission check for issue operations
export async function canEditIssue(
  user: JWTPayload,
  issueId: string
): Promise<boolean> {
  // Admins can edit any issue
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Users can only edit their own issues
  if (hasPermission(user.role as Role, "edit_issue")) {
    return await isIssueOwner(user.userId, issueId);
  }

  return false;
}

export async function canDeleteIssue(
  user: JWTPayload,
  issueId: string
): Promise<boolean> {
  // Admins can delete any issue
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Users can only delete their own issues
  return await isIssueOwner(user.userId, issueId);
}

export async function canCloseIssue(
  user: JWTPayload,
  issueId: string
): Promise<boolean> {
  // Only admins can close issues
  return user.role === ROLES.ADMIN;
}

export async function canEditComment(
  user: JWTPayload,
  commentId: string
): Promise<boolean> {
  // Admins can edit any comment
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Users can only edit their own comments
  return await isCommentOwner(user.userId, commentId);
}

export async function canDeleteComment(
  user: JWTPayload,
  commentId: string
): Promise<boolean> {
  // Admins can delete any comment
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Users can only delete their own comments
  return await isCommentOwner(user.userId, commentId);
}

// Middleware wrapper for API routes
export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    return handler(request, authResult.user, ...args);
  };
}

// Middleware wrapper with permission check
export function withPermission<T extends any[]>(
  permission: Permission,
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>
) {
  return withAuth(
    async (
      request: NextRequest,
      user: JWTPayload,
      ...args: T
    ): Promise<NextResponse> => {
      if (!requirePermission(user, permission)) {
        return NextResponse.json(
          { error: "Forbidden", message: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return handler(request, user, ...args);
    }
  );
}
