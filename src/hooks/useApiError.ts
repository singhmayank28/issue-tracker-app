"use client";

import { useCallback } from "react";
import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/errors";

export function useApiError() {
  const { showError } = useToast();

  const handleApiError = useCallback(
    (error: unknown) => {
      console.error("API Error:", error);

      if (error instanceof Response) {
        // Handle Response objects
        error
          .json()
          .then((errorData: ApiError) => {
            showError(
              errorData.error || "Request Failed",
              errorData.message ||
                "An error occurred while processing your request"
            );
          })
          .catch(() => {
            showError(
              "Request Failed",
              `Server returned ${error.status} ${error.statusText}`
            );
          });
      } else if (error && typeof error === "object" && "error" in error) {
        // Handle ApiError objects
        const apiError = error as ApiError;
        showError(
          apiError.error || "Error",
          apiError.message || "An unexpected error occurred"
        );
      } else if (error instanceof Error) {
        // Handle generic Error objects
        showError("Error", error.message || "An unexpected error occurred");
      } else if (typeof error === "string") {
        // Handle string errors
        showError("Error", error);
      } else {
        // Handle unknown error types
        showError(
          "Unknown Error",
          "An unexpected error occurred. Please try again."
        );
      }
    },
    [showError]
  );

  const handleFetchError = useCallback(
    async (response: Response) => {
      if (!response.ok) {
        try {
          const errorData: ApiError = await response.json();
          showError(
            errorData.error || "Request Failed",
            errorData.message ||
              `Server returned ${response.status} ${response.statusText}`
          );
        } catch {
          showError(
            "Request Failed",
            `Server returned ${response.status} ${response.statusText}`
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    },
    [showError]
  );

  return {
    handleApiError,
    handleFetchError,
  };
}
