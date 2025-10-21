"use client";

import { useAuth } from "@/contexts/AuthContext";

// Permission types (matching backend)
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
  [ROLES.USER]: ["read_issue", "create_issue", "create_comment"],
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

export function usePermissions() {
  const { user } = useAuth();

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  // Check if user can edit a specific issue
  const canEditIssue = (issueAuthorId: string): boolean => {
    if (!user) return false;

    // Admins can edit any issue
    if (user.role === ROLES.ADMIN) {
      return true;
    }

    // Users can only edit their own issues
    return user.id === issueAuthorId;
  };

  // Check if user can delete a specific issue
  const canDeleteIssue = (issueAuthorId: string): boolean => {
    if (!user) return false;

    // Admins can delete any issue
    if (user.role === ROLES.ADMIN) {
      return true;
    }

    // Users can only delete their own issues
    return user.id === issueAuthorId;
  };

  // Check if user can close issues (admin only)
  const canCloseIssue = (): boolean => {
    if (!user) return false;
    return user.role === ROLES.ADMIN;
  };

  // Check if user can edit a specific comment
  const canEditComment = (commentAuthorId: string): boolean => {
    if (!user) return false;

    // Admins can edit any comment
    if (user.role === ROLES.ADMIN) {
      return true;
    }

    // Users can only edit their own comments
    return user.id === commentAuthorId;
  };

  // Check if user can delete a specific comment
  const canDeleteComment = (commentAuthorId: string): boolean => {
    if (!user) return false;

    // Admins can delete any comment
    if (user.role === ROLES.ADMIN) {
      return true;
    }

    // Users can only delete their own comments
    return user.id === commentAuthorId;
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.role === ROLES.ADMIN;
  };

  // Check if user owns a resource
  const isOwner = (resourceAuthorId: string): boolean => {
    if (!user) return false;
    return user.id === resourceAuthorId;
  };

  return {
    hasPermission,
    canEditIssue,
    canDeleteIssue,
    canCloseIssue,
    canEditComment,
    canDeleteComment,
    isAdmin,
    isOwner,
    user,
  };
}
