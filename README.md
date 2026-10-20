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
- Up thẳng ảnh gốc từ điện thoại được, kể cả **HEIC** của iPhone. Mỗi lần deploy, bản đưa lên web tự thu nhỏ (cạnh dài 1600px), đổi HEIC sang JPG và xoá vị trí GPS trong ảnh. Ảnh gốc trong repo giữ nguyên.
- Mỗi file dưới 25MB (giới hạn upload của GitHub), mỗi lần upload tối đa 100 file.
- Ô ảnh trong vũ trụ cắt lấy phần vuông ở giữa; chạm vào ô sẽ thấy ảnh đầy đủ.

## Sửa lời chúc: trang có sẵn ô nhập

Mở https://ducthai1.github.io/embe-gift/sua-loi-chuc.html, gõ lời vào các ô (màn mở quà, lời chào, chữ bay, lời trên từng ảnh kèm hình nhỏ, lá thư), bấm **Xem trước** để thử, rồi **Lưu lên web**.

- Lần đầu cần dán một GitHub token (có hướng dẫn ngay trên trang). Token chỉ lưu trên máy đó.
- Lưu xong khoảng 1–2 phút trang tự cập nhật. Lời được ghi vào file `noi-dung.json`.
- Lời mặc định nằm ở `style/noi-dung-mac-dinh.js`; ô nào để trống thì dùng lời mặc định.

Nhạc nền: chép bài mới đè lên `style/hihi.mp3` (giữ nguyên tên).

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
