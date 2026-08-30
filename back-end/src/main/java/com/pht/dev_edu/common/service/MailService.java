package com.pht.dev_edu.common.service;

import com.pht.dev_edu.common.dto.MailPayload;

/**
 * Service for sending transactional, verification, and notification emails.
 */
public interface MailService {

    /**
     * Sends an email based on the provided payload specification.
     *
     * @param mailPayload the {@link MailPayload} containing recipient, subject, template name, and parameters.
     */
    void sendMail(MailPayload mailPayload);
}
