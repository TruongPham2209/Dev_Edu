package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.PaymentMethod;
import com.pht.dev_edu.enrollment.dto.PurchaseDetailResponse;
import com.pht.dev_edu.enrollment.dto.PurchaseRequest;

import java.util.UUID;

public interface PaymentService {
    PurchaseDetailResponse processPurchase(String username, PurchaseRequest purchaseRequest);

    void handlePaymentReturn(PaymentMethod method, String txnRef, String responseCode);

    void cancelPayment(String username, UUID paymentId);
}
