import { z } from "zod";

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Authentication validation schemas
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email must be less than 254 characters")
    .refine((email) => emailRegex.test(email), {
      message: "Please enter a valid email address",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
    .refine((password) => passwordRegex.test(password), {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(254, "Email must be less than 254 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Issue validation schemas
export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .refine((title) => title.trim().length > 0, {
      message: "Title cannot be empty or contain only whitespace",
    }),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters")
    .refine((description) => description.trim().length > 0, {
      message: "Description cannot be empty or contain only whitespace",
    }),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .refine((title) => title.trim().length > 0, {
      message: "Title cannot be empty or contain only whitespace",
    })
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters")
    .refine((description) => description.trim().length > 0, {
      message: "Description cannot be empty or contain only whitespace",
    })
    .optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment must be less than 1000 characters")
    .refine((content) => content.trim().length > 0, {
      message: "Comment cannot be empty or contain only whitespace",
    }),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment must be less than 1000 characters")
    .refine((content) => content.trim().length > 0, {
      message: "Comment cannot be empty or contain only whitespace",
    }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// API parameter validation schemas
export const issueIdSchema = z.string().cuid("Invalid issue ID format");
export const commentIdSchema = z.string().cuid("Invalid comment ID format");

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

export const issueFilterSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  authorId: z.string().cuid().optional(),
  search: z
    .string()
    .max(200, "Search query must be less than 200 characters")
    .optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IssueFilterInput = z.infer<typeof issueFilterSchema>;

// Validation helper functions
export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return passwordRegex.test(password);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): T {
  const result = schema.parse(input);

  // Sanitize string fields if they exist
  if (typeof result === "object" && result !== null) {
    const sanitized = { ...result };
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === "string") {
        (sanitized as any)[key] = sanitizeString(value);
      }
    }
    return sanitized;
  }

  return result;
}
