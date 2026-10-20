// Thu nhỏ ảnh trước khi đưa lên web để trang mở nhanh trên điện thoại.
// Chỉ chạy trên bản deploy (GitHub Actions), ảnh gốc trong repo giữ nguyên.
// Ảnh HEIC của iPhone được đổi sang JPG; EXIF (kể cả vị trí GPS) bị xoá.
// Dùng: node scripts/nen-anh.mjs <thư mục ảnh>
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const MAX_SIDE = 1600;
const dir = process.argv[2];
if (!dir) throw new Error('Thiếu thư mục ảnh: node scripts/nen-anh.mjs <thư mục>');

let before = 0;
let after = 0;

for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    const { name, ext } = parse(file);
    const type = ext.toLowerCase();
    const isHeic = type === '.heic' || type === '.heif';
    if (!isHeic && !['.jpg', '.jpeg', '.png', '.webp'].includes(type)) continue;

    try {
        let input = readFileSync(path);
        before += input.length;
        let outPath = path;

        if (isHeic) {
            input = Buffer.from(await heicConvert({ buffer: input, format: 'JPEG', quality: 0.92 }));
            outPath = join(dir, existsSync(join(dir, `${name}.jpg`)) ? `${name}-heic.jpg` : `${name}.jpg`);
        }

        // rotate() xoay theo EXIF trước khi EXIF bị bỏ, để ảnh dọc không bị nằm ngang
        const img = sharp(input).rotate().resize({
            width: MAX_SIDE,
            height: MAX_SIDE,
            fit: 'inside',
            withoutEnlargement: true,
        });
        const encoded = type === '.png' ? img.png({ compressionLevel: 9 })
            : type === '.webp' ? img.webp({ quality: 82 })
            : img.jpeg({ quality: 82, mozjpeg: true });
        const output = await encoded.toBuffer();

        writeFileSync(outPath, output);
        if (outPath !== path) rmSync(path);
        after += output.length;
    } catch (err) {
        // Ảnh hỏng thì bỏ ra khỏi bản web, không làm hỏng cả lần deploy
        console.warn(`Bỏ qua ${file}: ${err.message}`);
        rmSync(path);
    }
}

const mb = (n) => (n / 1048576).toFixed(1);
console.log(`Nén ảnh: ${mb(before)} MB → ${mb(after)} MB`);
