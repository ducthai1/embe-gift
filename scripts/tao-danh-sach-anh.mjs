// Tạo anh/danh-sach.json từ các file ảnh trong thư mục anh/.
// Trang web đọc file này để biết có những ảnh nào, nên ảnh đặt tên gì cũng được.
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'anh');
const all = readdirSync(dir);

const photos = all
    .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));

writeFileSync(join(dir, 'danh-sach.json'), JSON.stringify(photos, null, 2) + '\n');
console.log(`anh/danh-sach.json: ${photos.length} ảnh`);

// Ảnh HEIC của iPhone trình duyệt không hiển thị được
const heic = all.filter((f) => /\.hei[cf]$/i.test(f));
if (heic.length) {
    console.warn(`Bỏ qua ${heic.length} ảnh HEIC, hãy đổi sang JPG: ${heic.join(', ')}`);
}
