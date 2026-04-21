package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.PurchaseRequest;

public interface PaymentService {
    String processPurchase(String username, PurchaseRequest purchaseRequest);
}
