package com.pht.dev_edu.common.util;

import com.pht.dev_edu.common.exception.server.ServerInternalException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Component
public class PaymentUtils {
    @Value("${vnpay.url}")
    private static String vnpayUrl;

    @Value("${vnpay.returnUrl}")
    private static String vnpayReturnUrl;

    @Value("${vnpay.tmnCode}")
    private static String vnpayTmnCode;

    @Value("${vnpay.hashSecret}")
    private static String vnpayHashSecret;

    private static final String HCM_ZONE = "Asia/Ho_Chi_Minh";

    public static Map<String, String> createVnPayPaymentParams(String paymentId, BigDecimal amount, String ipAddress, String desc, LocalDateTime expireTime) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        String vnp_Amount = String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnpayTmnCode);
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_CurrCode", "VND");

        vnp_Params.put("vnp_TxnRef", paymentId);
        vnp_Params.put("vnp_OrderInfo", desc);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddress);

        Date now = new Date();
        SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss");

        TimeZone timeZone = TimeZone.getTimeZone(HCM_ZONE);
        format.setTimeZone(timeZone);

        ZoneId zoneId = ZoneId.of(HCM_ZONE);

        vnp_Params.put("vnp_CreateDate", format.format(now));
        vnp_Params.put("vnp_ExpireDate", format.format(
                Date.from(expireTime.atZone(zoneId).toInstant())
        ));

        return vnp_Params;
    }

    public static String getPaymentUrl(Map<String, String> vnp_Params) {
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        Iterator<String> itr = fieldNames.iterator();
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && !fieldValue.isEmpty()) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));

                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(vnpayHashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnpayUrl + "?" + queryUrl;
    }

    private static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new ServerInternalException("Error while calculating HMAC SHA512");
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            log.error("Error while calculating HMAC SHA512: {}", ex.getMessage());
            throw new ServerInternalException("Error while calculating HMAC SHA512.");
        }
    }
}
