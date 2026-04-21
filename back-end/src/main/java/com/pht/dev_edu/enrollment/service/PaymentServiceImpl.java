package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.enrollment.dto.PurchaseRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    @Override
    public String processPurchase(String username, PurchaseRequest purchaseRequest) {
        return "";
    }
}
