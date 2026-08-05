# Quy tắc bắt buộc khi bắt đầu phiên làm việc mới

Đây là project Next.js + MUI. Trước khi thực hiện **bất kỳ** yêu cầu nào của người dùng liên quan đến code, kiến trúc, API, hoặc convention của project, bắt buộc phải đọc các file tài liệu sau trong thư mục `docs` (nếu tồn tại):

1. `docs/architecture.md` — cấu trúc thư mục, cách tổ chức code, routing, phân chia server/client component
2. `docs/techstack.md` — tech stack, dependency, cách cấu hình/khởi tạo thư viện
3. `docs/api-integration.md` — danh sách API frontend đang gọi, cách xác thực, cách xử lý request/response/error
4. `docs/rule.md` — coding rule, convention, pattern chuẩn của project

## Nguyên tắc bắt buộc tuân thủ

- **Không suy đoán.** Mọi câu trả lời, đề xuất, hoặc đoạn code sinh ra phải dựa trên thông tin thực tế đọc được từ 4 file trên và từ codebase thực tế. Nếu thông tin không có trong tài liệu hoặc source code, phải nói rõ "không tìm thấy trong tài liệu/codebase" thay vì tự bịa ra cách làm.
- **Ưu tiên đọc file trước khi trả lời.** Nếu 4 file trên chưa được đọc trong phiên hiện tại, phải đọc trước khi đưa ra bất kỳ quyết định kỹ thuật nào (đặt tên, cấu trúc thư mục, cách gọi API, cách dùng MUI, state management...).
- **Tuân thủ convention đã ghi trong `docs/rule.md`.** Không tự ý áp dụng pattern, thư viện, hoặc cách tổ chức code khác với những gì đã được ghi nhận, trừ khi người dùng yêu cầu rõ ràng là muốn thay đổi convention.
- **Khi tài liệu (`docs/*.md`) và codebase thực tế mâu thuẫn nhau**, ưu tiên đọc lại codebase thực tế làm chuẩn, đồng thời báo cho người dùng biết tài liệu có thể đã lỗi thời và nên cập nhật lại.
- **Khi tạo tính năng mới**, phải đối chiếu với `docs/architecture.md` và `docs/rule.md` để đảm bảo đồng bộ về cấu trúc thư mục, cách đặt tên, cách gọi API, và cách quản lý state với phần còn lại của hệ thống.
- **Nếu 4 file tài liệu chưa tồn tại** (project chưa được scan/tạo docs), phải thông báo cho người dùng và đề xuất chạy lại quy trình tạo tài liệu trước khi tiếp tục các yêu cầu phát triển tính năng phức tạp.

## Khi nào cần đọc lại tài liệu trong cùng phiên

- Ngay từ tin nhắn đầu tiên của phiên làm việc mới.
- Sau khi người dùng thông báo có thay đổi lớn về cấu trúc project, dependency, hoặc API.
- Trước khi trả lời bất kỳ câu hỏi nào về "project này đang làm theo cách nào", "có đang dùng thư viện X không", "API này gọi ra sao"...
