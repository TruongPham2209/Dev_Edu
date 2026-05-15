import { useCallback } from "react";
import { useToast } from "./toast-context";
import { ApiError } from "./api/client";
import type { ApiResponse } from "./api/client";

/**
 * Maps documented API error statuses to user-friendly default messages.
 */
const STATUS_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "Dữ liệu không hợp lệ.",
  UNAUTHORIZED: "Vui lòng đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  CONFLICT: "Dữ liệu bị trùng lặp.",
  METHOD_NOT_ALLOWED: "Phương thức không được hỗ trợ.",
  REQUEST_TIMEOUT: "Yêu cầu đã hết hạn.",
  INTERNAL_SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
};

export function useApiWithToast() {
  const toast = useToast();

  const handleError = useCallback(
    (error: unknown, defaultMessage = "Đã xảy ra lỗi") => {
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
    (message = "Thành công") => {
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
