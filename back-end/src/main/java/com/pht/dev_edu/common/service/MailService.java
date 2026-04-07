package com.pht.dev_edu.common.service;

import com.pht.dev_edu.common.dto.MailPayload;

public interface MailService {
    void sendMail(MailPayload mailPayload);
}
