import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation Error",
        message: "Invalid input data",
        statusCode: 400,
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      } as ApiError,
      { status: 400 }
    );
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: "Application Error",
        message: error.message,
        statusCode: error.statusCode,
      } as ApiError,
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "Conflict",
            message: "A record with this data already exists",
            statusCode: 409,
          } as ApiError,
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: "Not Found",
            message: "The requested resource was not found",
            statusCode: 404,
          } as ApiError,
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: "Database Error",
            message: "A database error occurred",
            statusCode: 500,
          } as ApiError,
          { status: 500 }
        );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
        statusCode: 500,
      } as ApiError,
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    } as ApiError,
    { status: 500 }
  );
}

// Helper function to create standardized error responses
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
      details,
    } as ApiError,
    { status: statusCode }
  );
}

// Common error responses
export const ErrorResponses = {
  unauthorized: () =>
    createErrorResponse("Unauthorized", "Authentication required", 401),
  forbidden: () =>
    createErrorResponse("Forbidden", "Insufficient permissions", 403),
  notFound: (resource: string = "Resource") =>
    createErrorResponse("Not Found", `${resource} not found`, 404),
  badRequest: (message: string = "Invalid request") =>
    createErrorResponse("Bad Request", message, 400),
  conflict: (message: string = "Resource already exists") =>
    createErrorResponse("Conflict", message, 409),
  internalError: (message: string = "Internal server error") =>
    createErrorResponse("Internal Server Error", message, 500),
};
