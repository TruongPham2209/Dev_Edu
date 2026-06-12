package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.CheckoutDetailResponse;
import com.pht.dev_edu.enrollment.dto.CheckoutRequest;

import java.util.UUID;

public interface OrderService {
    CheckoutDetailResponse checkout(String username, CheckoutRequest checkoutRequest);

    CheckoutDetailResponse getOrderDetail(String username, UUID orderId);

    void cancelOrder(String username, UUID orderId);
}
