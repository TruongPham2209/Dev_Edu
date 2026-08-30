package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.PaymentInfoResponse;
import com.pht.dev_edu.enrollment.dto.PaymentMethod;
import com.pht.dev_edu.enrollment.dto.PaymentRequest;

import java.util.UUID;

/**
 * Service for handling payment gateway integrations (VNPay, MoMo) and transaction callbacks.
 */
public interface PaymentService {

    /**
     * Initiates a purchase payment transaction and generates the payment redirect URL.
     *
     * @param username       the username of the user making the payment.
     * @param paymentRequest the {@link PaymentRequest} containing order ID, payment method, and client IP.
     * @return the {@link PaymentInfoResponse} containing redirect URL and payment metadata.
     */
    PaymentInfoResponse processPurchase(String username, PaymentRequest paymentRequest);

    /**
     * Handles payment gateway IPN / return callback after transaction completion.
     *
     * @param method       the {@link PaymentMethod} used (e.g., VNPAY, MOMO).
     * @param txnRef       the transaction reference code.
     * @param responseCode the gateway response code (e.g., "00" for success in VNPay).
     */
    void handlePaymentReturn(PaymentMethod method, String txnRef, String responseCode);

    /**
     * Cancels an ongoing or uncompleted payment session.
     *
     * @param username  the username of the user canceling the payment.
     * @param paymentId the UUID of the payment session.
     */
    void cancelPayment(String username, UUID paymentId);
}
