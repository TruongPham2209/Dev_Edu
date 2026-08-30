package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;

import java.util.UUID;

/**
 * Service for recording audit logs and lifecycle changes on quizzes, questions, and assignments.
 */
public interface QuizAuditService {

    /**
     * Records an audit event for entity modifications into the audit log table.
     *
     * @param entityType  the type of the affected entity (QUIZ, QUESTION, ASSIGNMENT).
     * @param entityId    the UUID of the entity.
     * @param action      the {@link QuizAuditAction} performed (CREATE, UPDATE, DELETE, SUBMIT, APPROVE, REJECT).
     * @param performedBy the username of the user performing the action.
     * @param oldValue    the previous state/data.
     * @param newValue    the new state/data.
     * @param note        optional notes or review remarks.
     */
    void log(String entityType, UUID entityId, QuizAuditAction action, String performedBy, Object oldValue, Object newValue, String note);
}
