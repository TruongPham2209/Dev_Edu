package com.pht.dev_edu.common.exception;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.ExceptionUtils;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.*;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse> handleAuthenticationErrors(AuthenticationException ex) {
        String message = switch (ex) {
            case BadCredentialsException badCredentialsException -> "Incorrect username or password.";
            case AccountExpiredException accountExpiredException -> "Your account has expired.";
            case CredentialsExpiredException credentialsExpiredException ->
                    "Authentication credentials have expired. Please log in again.";
            case DisabledException disabledException -> "Your account has been disabled.";
            case LockedException lockedException -> "Your account has been locked.";
            case InsufficientAuthenticationException insufficientAuthenticationException ->
                    "Authentication required or missing credentials.";
            case null, default -> "Authentication failed. Please try again.";
        };

        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse> handleAccessDenied(Exception ex) {
        String message = "Access denied.";
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class,
            MethodArgumentNotValidException.class, MissingServletRequestPartException.class,
            IllegalArgumentException.class, MissingServletRequestParameterException.class,
            ConstraintViolationException.class, BindException.class})
    public ResponseEntity<ApiResponse> handleClientErrors(Exception ex) {
        String message = ExceptionUtils.getClientErrorMessage(ex);
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, DuplicateKeyException.class})
    public ResponseEntity<ApiResponse> handleConflictErrors(Exception ex) {
        String message = ExceptionUtils.getConflictErrorMessage(ex);
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({UnsupportedOperationException.class, HttpRequestMethodNotSupportedException.class})
    public ResponseEntity<ApiResponse> handleMethodNotAllowed(Exception ex) {
        String message = ExceptionUtils.getMethodNotAllowedMessage(ex);
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler({TimeoutException.class})
    public ResponseEntity<ApiResponse> handleTimeoutAndIOErrors(Exception ex) {
        String message = "This request has expired.";
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.REQUEST_TIMEOUT);
    }

    @ExceptionHandler({TransactionSystemException.class, DataAccessResourceFailureException.class, IOException.class,
            IllegalStateException.class})
    public ResponseEntity<ApiResponse> handleServerErrors(Exception ex) {
        String message;
        if (ex instanceof TransactionSystemException) {
            message = "A transaction error occurred while processing the request.";
        } else if (ex instanceof DataAccessResourceFailureException) {
            message = "Unable to connect to the database.";
        } else {
            message = ExceptionUtils.getServerErrorMessage(ex);
        }
        return ApiUtils.buildErrorResponse(message, ex, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(AbstractException.class)
    public ResponseEntity<ApiResponse> handleCustomErrors(AbstractException ex) {
        return ApiUtils.buildErrorResponse(ex.getMessage(), ex, ex.getHttpStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleUndefineException(Exception ex) {
        log.error("Lỗi không xác định từ phía server: {}", ex.getMessage(), ex);
        return ApiUtils.buildErrorResponse("Undefined exception.", ex, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}