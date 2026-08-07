-- =====================================================================
-- 1. BẢNG THÔNG BÁO CÁ NHÂN (notification_personal)
-- =====================================================================
-- Cursor paging danh sách thông báo cá nhân theo user (cursor = created_at + id)
CREATE INDEX IF NOT EXISTS idx_notification_personal_username_cursor
    ON notification_personal (username, created_at DESC, id DESC);

COMMENT ON INDEX idx_notification_personal_username_cursor IS
    'Phục vụ API lấy danh sách thông báo cá nhân theo cursor paging:
    WHERE username = ? [AND (created_at, id) < (?, ?)] ORDER BY created_at DESC, id DESC LIMIT ?.';


-- Đếm/lọc thông báo chưa đọc, đánh dấu tất cả đã đọc theo user
CREATE INDEX IF NOT EXISTS idx_notification_personal_username_is_read
    ON notification_personal (username)
    WHERE is_read = FALSE;

COMMENT ON INDEX idx_notification_personal_username_is_read IS
    'Phục vụ API đếm số thông báo chưa đọc (WHERE username = ? AND is_read = FALSE)
    và API đánh dấu tất cả đã đọc (UPDATE ... WHERE username = ? AND is_read = FALSE).';



-- =====================================================================
-- 2. BẢNG THÔNG BÁO NHÓM (notification_group)
-- =====================================================================
-- Cursor paging danh sách thông báo nhóm còn hoạt động (cursor = created_at + id)
CREATE INDEX IF NOT EXISTS idx_notification_group_active_cursor
    ON notification_group (created_at DESC, id DESC)
    WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_notification_group_active_cursor IS
    'Partial index chỉ trên các thông báo chưa bị xóa, phục vụ cursor paging danh sách
    thông báo nhóm: WHERE deleted_at IS NULL [AND (created_at, id) < (?, ?)]
    ORDER BY created_at DESC, id DESC LIMIT ?.';



-- =====================================================================
-- 3. BẢNG ROLE ĐÍCH CỦA THÔNG BÁO NHÓM (notification_group_target)
-- =====================================================================
-- Lấy danh sách role của 1 thông báo nhóm cụ thể (VD: xem chi tiết, hoặc xóa target khi xóa thông báo)
CREATE INDEX IF NOT EXISTS idx_notification_group_target_group_id
    ON notification_group_target (notification_group_id, role);

COMMENT ON INDEX idx_notification_group_target_group_id IS
    'Phục vụ API danh sách/đếm chưa đọc thông báo nhóm theo role của user đang đăng nhập:
    WHERE role = ? rồi JOIN notification_group ON notification_group.id = notification_group_id.';



-- =====================================================================
-- 4. BẢNG TRẠNG THÁI ĐỌC THÔNG BÁO NHÓM (notification_group_read_status)
-- =====================================================================
-- Tra cứu trạng thái đọc của 1 user cho danh sách thông báo nhóm (JOIN khi list/đếm chưa đọc)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_group_read_status_username
    ON notification_group_read_status (username, notification_group_id);

COMMENT ON INDEX idx_notification_group_read_status_username IS
    'Ràng buộc unique (notification_group_id, username), phục vụ upsert khi đánh dấu đã đọc:
    INSERT ... ON CONFLICT (notification_group_id, username) DO UPDATE SET is_read = TRUE, read_at = now().
    Phục vụ JOIN/LEFT JOIN theo username khi hiển thị danh sách thông báo nhóm kèm trạng thái
    đã đọc/chưa đọc của user hiện tại, và khi đếm số thông báo nhóm chưa đọc
    (những thông báo thuộc role của user nhưng không có dòng read_status tương ứng).';