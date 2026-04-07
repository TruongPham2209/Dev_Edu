package com.pht.dev_edu.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import jakarta.validation.ConstraintViolationException;

import java.io.IOException;
import java.util.List;

@Slf4j
public class ExceptionUtil {
    public static String getClientErrorMessage(Exception ex) {
        String message;
        String logMessage = "";
        switch (ex) {
            case MethodArgumentTypeMismatchException exType -> {
                logMessage = String.format("Tham số không đúng: %s. Giá trị %s không thể chuyển thành dạng %s",
                        exType.getName(), exType.getValue(), exType.getRequiredType() != null ? exType.getRequiredType().getSimpleName() : null);
                message = "Tham số đầu vào không hợp lệ.";
            }
            case MethodArgumentNotValidException methodArgumentNotValidException -> {
                List<String> errorMessages = methodArgumentNotValidException.getBindingResult().getFieldErrors().stream()
                        .map(DefaultMessageSourceResolvable::getDefaultMessage).toList();
                logMessage = "Xác thực không thành công cho các tham số: " + String.join("; ", errorMessages);
                message = "Dữ liệu đầu vào không hợp lệ.";
            }
            case MissingServletRequestPartException missingServletRequestPartException ->
                    message = "Request body bị thiếu.";
            case MissingServletRequestParameterException exParam -> {
                logMessage = String.format("Sai tham số bắt buộc: '%s'. Dạng mong đợi: '%s'.", exParam.getParameterName(),
                        exParam.getParameterType());
                message = "Yêu cầu thiếu tham số bắt buộc.";
            }
            case ConstraintViolationException constraintViolationException -> {

                List<String> violationMessages = constraintViolationException.getConstraintViolations().stream()
                        .map(violation -> String.format("Thuộc tính '%s' %s: %s", violation.getPropertyPath(),
                                violation.getMessage(), violation.getInvalidValue()))
                        .toList();

                logMessage = "Lỗi vi phạm ràng buộc: " + String.join("; ", violationMessages);
                message = "Lỗi dữ liệu đầu vào không hợp lệ.";
            }
            case BindException bindException -> {
                List<String> bindErrorMessages = bindException.getBindingResult().getFieldErrors().stream()
                        .map(error -> String.format("Trường '%s' %s", error.getField(), error.getDefaultMessage()))
                        .toList();
                logMessage = "Lỗi binding: " + String.join("; ", bindErrorMessages);
                message = "Lỗi dữ liệu đầu vào không hợp lệ.";
            }
            case null, default -> {
                message = "Yêu cầu không hợp lệ.";
                logMessage = message;
            }
        }

        log.error("Error processing client request: {}. Exception detail: {}", logMessage, ex != null ? ex.getMessage() : "Null", ex);
        return message;
    }

    public static String getMethodNotAllowedMessage(Exception ex) {
        String message;
        String logMessage;
        if (ex instanceof UnsupportedOperationException) {
            logMessage = message = "Thao tác này không được hỗ trợ.";
        } else if (ex instanceof HttpRequestMethodNotSupportedException exMethod) {
            String supportedMethods = exMethod.getSupportedHttpMethods() != null
                    ? String.join(", ", exMethod.getSupportedHttpMethods().toString())
                    : "không có phương thức nào được hỗ trợ";
            logMessage = String.format(
                    "Phương thức '%s' không được hỗ trợ cho yêu cầu này. Các phương thức hợp lệ là: %s.",
                    exMethod.getMethod(), String.join(", ", supportedMethods));
            message = "Phương thức không được phép.";
        } else {
            logMessage = message = "Phương thức không được phép.";
        }

        log.error("Error processing method not allowed: {}. Exception detail: {}", logMessage, ex != null ? ex.getMessage() : "Null", ex);
        return message;
    }

    public static String getServerErrorMessage(Exception ex) {
        String message;
        if (ex instanceof IOException) {
            message = "Đã xảy ra lỗi I/O khi xử lý yêu cầu.";
        } else if (ex instanceof IllegalStateException) {
            message = "Hệ thống đang ở trạng thái không hợp lệ để xử lý yêu cầu.";
        } else {
            message = "Lỗi máy chủ.";
        }

        return message;
    }

    public static String getConflictErrorMessage(Exception ex) {
        String message;
        if (ex instanceof DataIntegrityViolationException) {
            message = "Vi phạm ràng buộc dữ liệu.";
        } else {
            message = "Lỗi xung đột.";
        }

        return message;
    }
}
