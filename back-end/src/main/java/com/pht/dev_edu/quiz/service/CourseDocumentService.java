package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.response.CourseDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Interface quản lý Thư viện Tài liệu chung (Global Document Library) cho môn học.
 * Hỗ trợ truy vấn phân trang bằng Cursor, Admin upload trực tiếp file PDF và xóa mềm tài liệu.
 */
public interface CourseDocumentService {

    /**
     * Lấy danh sách các tài liệu thuộc Thư viện chung (visibility = GLOBAL, status = READY)
     * sử dụng phân trang bằng Con trỏ (Cursor-based Pagination) với kích thước trang cố định là 15.
     *
     * @param nextCursor Con trỏ mã hóa trang tiếp theo (Time + UUID), truyền null/trống cho trang đầu
     * @param fileName   Từ khóa lọc theo tên file hoặc tiêu đề tài liệu (không bắt buộc)
     * @return CustomPaging chứa danh sách CourseDocumentResponse và con trỏ nextCursor cho trang kế tiếp
     */
    CustomPaging<CourseDocumentResponse> getGlobalDocumentLibrary(String nextCursor, String fileName);

    /**
     * Cho phép quản trị viên (Admin) upload trực tiếp file PDF vào Thư viện chung mà không cần thông qua bước sinh Quiz.
     *
     * @param file     File tài liệu PDF cần upload
     * @param title    Tiêu đề mô tả tài liệu (tùy chọn)
     * @param username Tên tài khoản Admin thực hiện upload
     * @return CourseDocumentResponse thông tin bản ghi tài liệu vừa lưu
     */
    CourseDocumentResponse uploadGlobalDocumentByAdmin(
            MultipartFile file,
            String title,
            String username
    );

    /**
     * Thực hiện xóa mềm (Soft Delete) một tài liệu khỏi Thư viện chung.
     *
     * @param documentId ID của tài liệu cần xóa
     * @param username   Tên tài khoản người thực hiện xóa
     */
    void deleteGlobalDocument(UUID documentId, String username);
}
