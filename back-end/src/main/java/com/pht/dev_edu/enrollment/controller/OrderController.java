package com.pht.dev_edu.enrollment.controller;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.enrollment.dto.CheckoutRequest;
import com.pht.dev_edu.enrollment.dto.PaymentStatus;
import com.pht.dev_edu.enrollment.service.OrderItemService;
import com.pht.dev_edu.enrollment.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;
    OrderItemService orderItemService;

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/items/courses")
    public ResponseEntity<?> getCoursesInCart(
            @RequestParam(required = false) String nextCursor
    ) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var cartItems = orderItemService.getCoursesInCart(username, nextCursor);
        return ApiUtils.buildSuccessResponse(cartItems);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/history")
    public ResponseEntity<?> getOrderHistory(
            @RequestParam(required = false) String nextCursor,
            @RequestParam PaymentStatus orderStatus
    ) {
        if (orderStatus == PaymentStatus.PENDING) {
            throw new BadRequestException("Order history cannot be retrieved for pending orders");
        }

        String username = SecurityContextUtils.getCurrentUsernameForController();
        var orders = orderItemService.getOrderHistory(username, orderStatus, nextCursor);
        return ApiUtils.buildSuccessResponse(orders);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody @Valid CheckoutRequest req) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        var detail = orderService.checkout(username, req);
        return ApiUtils.buildSuccessResponse(detail);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("")
    public ResponseEntity<?> getOrderDetail(@RequestParam UUID orderId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        var detail = orderService.getOrderDetail(username, orderId);
        return ApiUtils.buildSuccessResponse(detail);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancelOrder(@RequestParam UUID orderId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();

        orderService.cancelOrder(username, orderId);
        return ApiUtils.buildSuccessResponse("Order has been cancelled");
    }
}
