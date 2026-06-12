package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.PaymentInfoResponse;
import com.pht.dev_edu.enrollment.dto.PaymentMethod;
import com.pht.dev_edu.enrollment.dto.PaymentRequest;

import java.util.UUID;

public interface PaymentService {
    PaymentInfoResponse processPurchase(String username, PaymentRequest paymentRequest);

    void handlePaymentReturn(PaymentMethod method, String txnRef, String responseCode);

    void cancelPayment(String username, UUID paymentId);
}
