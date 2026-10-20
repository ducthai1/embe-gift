import { DEFAULT_CONTENT } from './noi-dung-mac-dinh.js';

export const PREVIEW_KEY = 'embe-gift-xem-truoc';

const isText = (s) => typeof s === 'string' && s.trim() !== '';

// Gộp noi-dung.json với mặc định: mục nào thiếu hoặc sai kiểu thì dùng mặc định.
// Lời nhắn ảnh giữ nguyên vị trí (ô trống vẫn giữ chỗ) vì ảnh thứ N ứng với ô thứ N.
export function mergeContent(data) {
    const out = structuredClone(DEFAULT_CONTENT);
    if (!data || typeof data !== 'object') return out;

    for (const key of Object.keys(DEFAULT_CONTENT)) {
        const value = data[key];
        if (Array.isArray(DEFAULT_CONTENT[key]) ? Array.isArray(value) : typeof value === 'string') {
            out[key] = value;
        }
    }

    out.welcomeLines = out.welcomeLines.filter(isText);
    out.floatingTexts = out.floatingTexts.filter(isText);
    out.photoCaptions = out.photoCaptions.map((c) => ({
        title: String(c?.title ?? ''),
        text: String(c?.text ?? ''),
    }));
    return out;
}

// Lời nhắn cho ảnh thứ index (tính từ 0); ô để trống thì lấy lời mặc định
export function captionFor(content, index) {
    const list = content.photoCaptions;
    const own = list.length ? list[index % list.length] : null;
    if (own && (isText(own.title) || isText(own.text))) return own;
    const defaults = DEFAULT_CONTENT.photoCaptions;
    return defaults[index % defaults.length];
}

// Đọc noi-dung.json cạnh trang; lỗi mạng hay chưa có file thì dùng lời mặc định.
// Mở trang với ?xem-thu thì dùng bản nháp từ trang sửa lời (lưu trên máy này).
export async function loadContent() {
    if (new URLSearchParams(location.search).has('xem-thu')) {
        try {
            const draft = localStorage.getItem(PREVIEW_KEY);
            if (draft) return mergeContent(JSON.parse(draft));
        } catch {
            // không đọc được bản nháp thì dùng bản đã lưu
        }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
        const res = await fetch('./noi-dung.json', { cache: 'no-store', signal: controller.signal });
        return mergeContent(res.ok ? await res.json() : null);
    } catch {
        return mergeContent(null);
    } finally {
        clearTimeout(timer);
    }
}
