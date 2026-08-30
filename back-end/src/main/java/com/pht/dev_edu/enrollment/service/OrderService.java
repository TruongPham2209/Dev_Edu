package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.CheckoutDetailResponse;
import com.pht.dev_edu.enrollment.dto.CheckoutRequest;

import java.util.UUID;

/**
 * Service for handling order checkout, retrieval, and cancellations.
 */
public interface OrderService {

    /**
     * Creates a new checkout order from specified course IDs.
     *
     * @param username        the username of the purchasing user.
     * @param checkoutRequest the {@link CheckoutRequest} containing course IDs.
     * @return the created {@link CheckoutDetailResponse}.
     */
    CheckoutDetailResponse checkout(String username, CheckoutRequest checkoutRequest);

    /**
     * Retrieves detailed information of an order by ID.
     *
     * @param username the username of the user requesting the order detail.
     * @param orderId  the UUID of the order.
     * @return the {@link CheckoutDetailResponse}.
     */
    CheckoutDetailResponse getOrderDetail(String username, UUID orderId);

    /**
     * Cancels an unpaid pending order.
     *
     * @param username the username of the user requesting cancellation.
     * @param orderId  the UUID of the order to cancel.
     */
    void cancelOrder(String username, UUID orderId);
}
