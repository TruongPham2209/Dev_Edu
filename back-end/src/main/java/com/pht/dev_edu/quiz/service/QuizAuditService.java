package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;

import java.util.UUID;

public interface QuizAuditService {
    void log(String entityType, UUID entityId, QuizAuditAction action, String performedBy, Object oldValue, Object newValue, String note);
}
