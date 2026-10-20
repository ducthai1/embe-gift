# embe-gift 🌌

Vũ trụ 3D tặng em: chạm hộp quà, hàng trăm tấm ảnh cùng hạt sáng hồng xếp thành trái tim khổng lồ.
Kéo để xoay, cuộn để phóng to, chạm ảnh để đọc lời nhắn, bấm 💌 để mở thư.

Link: https://ducthai1.github.io/embe-gift/

## Thêm ảnh: thả vào thư mục `anh/`

Tên file gì cũng được, không cần đánh số. Ảnh hiện theo thứ tự tên file.

**Cách nhanh nhất (ngay trên GitHub, cả điện thoại cũng làm được):**
1. Mở https://github.com/ducthai1/embe-gift/tree/main/anh
2. Bấm **Add file → Upload files**, kéo ảnh vào, bấm **Commit changes**.
3. Chờ khoảng 1 phút để GitHub Actions tự cập nhật trang (xem ở tab **Actions**), rồi mở link.

Lưu ý về ảnh:
- Dùng JPG, PNG hoặc WebP. Ảnh **HEIC** của iPhone trình duyệt không mở được, hãy đổi sang JPG trước.
- Mỗi ảnh nên rộng khoảng 1080px và dưới 300KB để mở nhanh trên điện thoại. Ô ảnh trong vũ trụ cắt lấy phần vuông ở giữa.
- Khoảng 10–30 ảnh là đẹp.

## Sửa chữ, thư và nhạc

| Muốn đổi | Sửa ở |
| --- | --- |
| Lời hiện ra khi chạm vào ảnh (ảnh thứ N dùng lời thứ N) | `style/script.js` → `CONFIG.photoCaptions` |
| Các dòng chữ bay trong vũ trụ (nên thêm tên em) | `style/script.js` → `CONFIG.floatingTexts` |
| Lá thư khi bấm 💌 | `style/script.js` → `CONFIG.loveLetter` |
| Chữ màn mở quà, tiêu đề thư | `index.html` |
| Nhạc nền | chép bài mới đè lên `style/hihi.mp3` (giữ nguyên tên) |

## Bật trang web (làm 1 lần)

Vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
Sau đó mỗi lần push hoặc upload ảnh, trang tự cập nhật.

## Xem thử trên máy

Mở thẳng `index.html` sẽ ra màn hình trắng, cần chạy qua server:

```bash
node scripts/tao-danh-sach-anh.mjs   # quét lại thư mục anh/ sau khi thêm ảnh
python3 -m http.server 8000          # rồi mở http://localhost:8000
```

---

Dựa trên [universe-and-you](https://github.com/ThuongNT-ktpm/universe-and-you) của ThuongNT-ktpm. Repo gốc không ghi giấy phép, chỉ dùng làm quà riêng.
