import { useCallback } from "react";
import { useToast } from "./toast-context";
import type { ApiError, ApiResponse } from "./type/api";

/**
 * Maps documented API error statuses to user-friendly default messages.
 */
const STATUS_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "Invalid data.",
  UNAUTHORIZED: "Please login to continue.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "Data not found.",
  CONFLICT: "Data is duplicated.",
  METHOD_NOT_ALLOWED: "Unsupported method.",
  REQUEST_TIMEOUT: "Request timeout.",
  INTERNAL_SERVER_ERROR: "Internal server error. Please try again later.",
};

export function useApiWithToast() {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, defaultMessage = "Something went wrong") => {
      if (error instanceof ApiError) {
        // Prefer server message, fall back to status-based message, then default
        const message =
          error.serverMessage ||
          STATUS_MESSAGES[error.status] ||
          defaultMessage;
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message || defaultMessage);
      } else {
        toast.error(defaultMessage);
      }
    },
    [toast],
  );

  const showSuccess = useCallback(
    (message = "Success") => {
      toast.success(message);
    },
    [toast],
  );

  const handleSuccess = useCallback(
    (response: ApiResponse<unknown> | { message?: string } | null) => {
      if (response && "message" in response && response.message) {
        showSuccess(response.message);
      }
    },
    [showSuccess],
  );

  return {
    toast,
    handleError,
    handleSuccess,
    showSuccess,
  };
}
