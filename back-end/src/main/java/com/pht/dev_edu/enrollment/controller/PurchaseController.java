package com.pht.dev_edu.enrollment.controller;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.enrollment.dto.PaymentMethod;
import com.pht.dev_edu.enrollment.dto.PaymentRequest;
import com.pht.dev_edu.enrollment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PurchaseController {
    PaymentService paymentService;

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping
    public ResponseEntity<?> purchase(@RequestBody @Valid PaymentRequest paymentRequest, HttpServletRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        String ipAddress = getIpAddress(request);
        paymentRequest.setIpAddress(ipAddress);

        var purchase = paymentService.processPurchase(username, paymentRequest);
        return ApiUtils.buildSuccessResponse(purchase);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> handleVnPayReturn(HttpServletRequest request) {
        String txnRef = request.getParameter("vnp_TxnRef");
        String responseCode = request.getParameter("vnp_ResponseCode");

        if (!StringUtils.hasText(txnRef) || !StringUtils.hasText(responseCode)) {
            log.error("Missing required parameters in VnPay return: txnRef={}, responseCode={}", txnRef, responseCode);
            throw new BadRequestException("Missing required parameters.");
        }

        paymentService.handlePaymentReturn(PaymentMethod.VNPAY, txnRef, responseCode);
        return ApiUtils.buildSuccessResponse(Map.of(
                "message", "Payment return processed successfully."
        ));
    }

    @DeleteMapping("/cancel")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<?> cancelPayment(@RequestParam("paymentId") UUID paymentId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        paymentService.cancelPayment(username, paymentId);
        return ApiUtils.buildSuccessResponse(Map.of(
                "message", "Payment cancelled successfully."
        ));
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }
}
