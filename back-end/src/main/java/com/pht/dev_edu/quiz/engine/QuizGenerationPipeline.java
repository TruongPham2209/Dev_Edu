package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import com.pht.dev_edu.quiz.dto.response.QuestionSourceTraceResponse;
import com.pht.dev_edu.quiz.dto.response.QuizGenerationJobResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * Interface điều phối tổng thể (Orchestrator Pipeline) của hệ thống Tự động sinh Quiz từ Tài liệu.
 * Quản lý khởi chạy công việc bất đồng bộ trên Virtual Threads, kiểm tra quyền hạn, đếm slot câu hỏi và theo dõi trạng thái tiến độ.
 */
public interface QuizGenerationPipeline {

    /**
     * Khởi tạo một công việc sinh đề thi bất đồng bộ từ tài liệu (File Upload hoặc Global Library Document).
     * Thực hiện kiểm tra quyền truy cập quizId, tính số câu còn lại theo chỉ tiêu loại câu hỏi,
     * khởi tạo QuizGenerationJob ở trạng thái PENDING và đẩy công việc vào Virtual Thread Executor.
     *
     * @param request    Dữ liệu yêu cầu cấu hình sinh Quiz từ client
     * @param fileStream Luồng đọc dữ liệu file tài liệu PDF (nếu upload trực tiếp)
     * @param username   Tên tài khoản người dùng thực hiện yêu cầu
     * @return QuizGenerationJobResponse phản hồi thông tin Job vừa tạo (ID, status PENDING, v.v.)
     */
    QuizGenerationJobResponse startGenerationJob(
            GenerateQuizFromDocumentRequest request,
            InputStream fileStream,
            String username
    );

    /**
     * Khởi tạo một công việc sinh đề thi từ file upload trực tiếp (MultipartFile).
     * Xử lý đọc luồng file, khởi tạo request DTO và ủy quyền cho pipeline xử lý.
     *
     * @param quizId       ID bài thi cần bổ sung câu hỏi
     * @param description  Mô tả chi tiết yêu cầu độ khó, chất lượng hoặc hướng dẫn phân bổ
     * @param saveDocument Checkbox có lưu tài liệu vào Thư viện chung hay không
     * @param file         File tài liệu PDF upload từ client
     * @param username     Tên tài khoản người thực hiện
     * @return QuizGenerationJobResponse phản hồi thông tin Job vừa tạo
     */
    QuizGenerationJobResponse startGenerationJobFromFile(
            UUID quizId,
            String description,
            Boolean saveDocument,
            MultipartFile file,
            String username
    );

    /**
     * Truy vấn thông tin trạng thái, bước xử lý hiện tại, số lượng câu đã xử lý/chấp nhận/từ chối của một Job.
     *
     * @param jobId    ID công việc sinh Quiz cần tra cứu
     * @param username Tên tài khoản thực hiện yêu cầu
     * @return QuizGenerationJobResponse chứa thông tin trạng thái chi tiết
     */
    QuizGenerationJobResponse getJobStatus(UUID jobId, String username);

    /**
     * Truy vấn thông tin vết nguồn gốc (Traceability) của một câu hỏi đã sinh từ tài liệu.
     *
     * @param jobId      ID công việc sinh Quiz
     * @param questionId ID câu hỏi cần tra cứu vết nguồn gốc
     * @return QuestionSourceTraceResponse chứa thông tin trích dẫn trang, chương, chunk và model
     */
    QuestionSourceTraceResponse getQuestionSourceTraceability(UUID jobId, UUID questionId);
}
