package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.entity.CourseDocumentEntity;
import com.pht.dev_edu.quiz.entity.QuizGenerationJobEntity;

/**
 * Interface thực thi Chính sách lưu tài liệu (Save Policy) và Quản lý Nhật ký Audit (Document Upload Audit Trail).
 * Chịu trách nhiệm chuyển trạng thái tài liệu từ TEMPORARY sang GLOBAL, confirm bản ghi trong file_upload tránh bị cronjob xóa,
 * và ghi nhận lịch sử audit cho mọi lượt upload.
 */
public interface DocumentPromotionService {

    /**
     * Áp dụng Save Policy sau khi pipeline hoàn tất sinh câu hỏi và ghi nhật ký Audit.
     * <p>
     * Nếu saveDocument = true VÀ Quiz được tạo thành công (acceptedCount > 0):
     * - Promote tài liệu tạm thành Global Document (visibility = GLOBAL, isPromoted = true).
     * - Confirm bản ghi trong bảng file_upload (status = COMPLETED) để bảo vệ khỏi cronjob dọn rác.
     * <p>
     * Ngược lại, nếu thất bại hoặc saveDocument = false:
     * - Giữ tài liệu dưới dạng TEMPORARY hoặc đánh dấu FAILED để tự dọn dẹp theo TTL.
     *
     * @param job            Bản ghi công việc sinh đề thi vừa hoàn tất
     * @param request        Request sinh quiz ban đầu từ người dùng
     * @param documentEntity Bản ghi tài liệu trong CSDL (nếu có)
     * @param quizSuccess    Trạng thái thành công của quy trình sinh quiz
     * @param username       Tên tài khoản người thực hiện
     * @param userRole       Vai trò của người thực hiện (LECTURER / ADMIN)
     * @return boolean true nếu tài liệu được promote thành công vào Thư viện chung, ngược lại false
     */
    boolean applySavePolicyAndAudit(
            QuizGenerationJobEntity job,
            GenerateQuizFromDocumentRequest request,
            CourseDocumentEntity documentEntity,
            boolean quizSuccess,
            String username,
            String userRole
    );
}
