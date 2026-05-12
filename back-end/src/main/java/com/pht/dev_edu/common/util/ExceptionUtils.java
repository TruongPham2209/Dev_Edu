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
public class ExceptionUtils {
    public static String getClientErrorMessage(Exception ex) {
        String message;
        String logMessage = "";
        switch (ex) {
            case MethodArgumentTypeMismatchException exType -> {
                logMessage = String.format(
                        "Invalid parameter: %s. Value '%s' cannot be converted to type %s",
                        exType.getName(),
                        exType.getValue(),
                        exType.getRequiredType() != null
                                ? exType.getRequiredType().getSimpleName()
                                : null
                );
                message = "Invalid input params.";
            }
            case MethodArgumentNotValidException methodArgumentNotValidException -> {
                List<String> errorMessages = methodArgumentNotValidException
                        .getBindingResult().getFieldErrors().stream()
                        .map(DefaultMessageSourceResolvable::getDefaultMessage).toList();
                logMessage = "Validation failed for request parameters: "
                        + String.join("; ", errorMessages);

                message = "Invalid input data.";
            }
            case MissingServletRequestPartException missingServletRequestPartException -> {
                logMessage = "Missing required request part (request body or multipart part).";
                message = "Request body is missing.";
            }
            case MissingServletRequestParameterException exParam -> {
                logMessage = String.format(
                        "Missing required parameter: '%s'. Expected type: '%s'.",
                        exParam.getParameterName(),
                        exParam.getParameterType()
                );
                message = "Missing required request parameter.";
            }
            case ConstraintViolationException constraintViolationException -> {

                List<String> violationMessages = constraintViolationException.getConstraintViolations().stream()
                        .map(violation -> String.format(
                                        "Property '%s' %s: %s",
                                        violation.getPropertyPath(),
                                        violation.getMessage(),
                                        violation.getInvalidValue()
                        ))
                        .toList();

                logMessage = "Constraint violation: " + String.join("; ", violationMessages);
                message = "Invalid input data.";
            }
            case BindException bindException -> {
                List<String> bindErrorMessages = bindException.getBindingResult().getFieldErrors().stream()
                        .map(error -> String.format(
                                "Field '%s' %s",
                                error.getField(),
                                error.getDefaultMessage()
                        ))
                        .toList();
                logMessage = "Binding error: " + String.join("; ", bindErrorMessages);
                message = "Invalid input data.";
            }
            case null, default -> {
                message = "Bad request.";
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
            logMessage = message = "This operation is not supported.";
        } else if (ex instanceof HttpRequestMethodNotSupportedException exMethod) {
            String supportedMethods = exMethod.getSupportedHttpMethods() != null
                    ? String.join(", ", exMethod.getSupportedHttpMethods().toString())
                    : "no supported methods";
            logMessage = String.format(
                    "HTTP method '%s' is not supported for this request. Allowed methods are: %s.",
                    exMethod.getMethod(),
                    supportedMethods
            );
            message = "Method not allowed.";
        } else {
            logMessage = message = "Method not allowed.";
        }

        log.error("Error processing method not allowed: {}. Exception detail: {}", logMessage, ex != null ? ex.getMessage() : "Null", ex);
        return message;
    }

    public static String getServerErrorMessage(Exception ex) {
        String message;
        if (ex instanceof IOException) {
            message = "An I/O error occurred while processing the request.";
        } else if (ex instanceof IllegalStateException) {
            message = "The system is in an invalid state to process the request.";
        } else {
            message = "Internal server error.";
        }

        return message;
    }

    public static String getConflictErrorMessage(Exception ex) {
        String message;
        if (ex instanceof DataIntegrityViolationException) {
            message = "Data constraint violation.";
        } else {
            message = "Conflict error.";
        }

        return message;
    }

    public static String getStackTraceAsString(Exception ex) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : ex.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }
}
