// Chế độ dự phòng khi máy không tạo được WebGL (Chrome tắt tăng tốc phần cứng, GPU bị chặn...):
// ảnh, trái tim và chữ bay dựng bằng HTML + CSS thay cho cảnh 3D. Hộp quà, lời nhắn, lá thư, nhạc vẫn như bản 3D.

let cloud = null;

function ensureCloud() {
    if (cloud) return cloud;
    cloud = document.createElement('div');
    cloud.id = 'photo-cloud';
    const heart = document.createElement('div');
    heart.className = 'cloud-heart';
    heart.textContent = '💗';
    cloud.append(heart);
    document.body.prepend(cloud);
    return cloud;
}

// Đặt một ảnh lên màn hình theo hướng của ô 3D đã chọn (giữ được việc ảnh chụp liền nhau nằm xa nhau)
export function addCloudPhoto(src, direction, onTap) {
    const box = ensureCloud();
    const depth = (direction.z + 1) / 2; // 0 = xa, 1 = gần
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'cloud-photo';
    tile.style.left = `${50 + direction.x * 44}%`;
    tile.style.top = `${50 - direction.y * 40}%`;
    tile.style.zIndex = String(Math.round(depth * 100));
    tile.style.setProperty('--s', (0.7 + depth * 0.5).toFixed(2));
    tile.style.setProperty('--o', (0.6 + depth * 0.4).toFixed(2));
    tile.style.setProperty('--d', `${(4 + Math.random() * 4).toFixed(1)}s`);
    tile.style.setProperty('--delay', `${(-Math.random() * 6).toFixed(1)}s`);
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    tile.append(img);
    tile.addEventListener('click', onTap);
    box.append(tile);
}

// Các dòng chữ trôi ngang qua màn hình, mỗi dòng một độ cao và tốc độ
export function addCloudTexts(texts) {
    const box = ensureCloud();
    texts.forEach((text, i) => {
        const line = document.createElement('span');
        line.className = 'cloud-text';
        line.textContent = text;
        line.style.top = `${8 + ((i * 37) % 84)}%`;
        line.style.setProperty('--d', `${(18 + Math.random() * 14).toFixed(1)}s`);
        line.style.setProperty('--delay', `${(-Math.random() * 30).toFixed(1)}s`);
        box.append(line);
    });
}
