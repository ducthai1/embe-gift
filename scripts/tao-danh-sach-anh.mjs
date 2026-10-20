// Tạo danh-sach.json từ các file ảnh trong thư mục anh/.
// Trang web đọc file này để biết có những ảnh nào, nên ảnh đặt tên gì cũng được.
// Dùng: node scripts/tao-danh-sach-anh.mjs [thư mục ảnh, mặc định anh/]
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'anh');
const all = readdirSync(dir);

const photos = all
    .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));

writeFileSync(join(dir, 'danh-sach.json'), JSON.stringify(photos, null, 2) + '\n');
console.log(`danh-sach.json: ${photos.length} ảnh`);

// Trình duyệt không hiển thị được HEIC; bản deploy tự đổi sang JPG, còn xem trên máy thì chưa hiện
const heic = all.filter((f) => /\.hei[cf]$/i.test(f));
if (heic.length) {
    console.warn(`${heic.length} ảnh HEIC chưa hiện khi xem trên máy (lên web sẽ tự đổi sang JPG): ${heic.join(', ')}`);
}
