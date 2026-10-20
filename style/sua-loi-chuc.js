// Trang sửa lời chúc: đọc noi-dung.json, cho sửa trong các ô, rồi ghi lại vào repo qua GitHub API.
// Mỗi lần ghi là một commit, GitHub Actions tự deploy lại trang sau khoảng 1–2 phút.
import { DEFAULT_CONTENT } from './noi-dung-mac-dinh.js';
import { loadContent, mergeContent, PREVIEW_KEY } from './tai-noi-dung.js';

const REPO = 'ducthai1/embe-gift';
const BRANCH = 'main';
const FILE = 'noi-dung.json';
const API = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
const TOKEN_KEY = 'embe-gift-token';

const $ = (sel) => document.querySelector(sel);
const statusEl = $('#status');
const tokenInput = $('#token');

let content = structuredClone(DEFAULT_CONTENT);
let photos = [];
let dirty = false;

const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* chế độ ẩn danh */ } },
};

function setStatus(text, kind = '') {
    statusEl.textContent = text;
    statusEl.className = kind;
}

function markDirty() {
    dirty = true;
    setStatus('Có thay đổi chưa lưu');
}

/* ---------- Mã hoá base64 cho chữ tiếng Việt (UTF-8) ---------- */
function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
}
const fromBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

/* ---------- GitHub ---------- */
async function github(method, body) {
    const res = await fetch(method === 'GET' ? `${API}?ref=${BRANCH}` : API, {
        method,
        cache: 'no-store',
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${tokenInput.value.trim()}`,
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) throw new Error('Token sai hoặc đã hết hạn.');
    if (res.status === 403) throw new Error('Token chưa có quyền ghi (Contents: Read and write) vào repo embe-gift.');
    return res;
}

// Đọc bản mới nhất ngay trên GitHub (bản trên web có thể chưa kịp deploy). Trả về sha để ghi đè.
async function fetchRemote() {
    const res = await github('GET');
    if (res.status === 404) return { sha: null, data: null };
    if (!res.ok) throw new Error(`GitHub báo lỗi ${res.status}`);
    const json = await res.json();
    return { sha: json.sha, data: JSON.parse(fromBase64(json.content)) };
}

/* ---------- Dựng form ---------- */
function bindField(el) {
    const key = el.dataset.field;
    el.value = content[key];
    el.oninput = () => { content[key] = el.value; markDirty(); };
}

function renderList(container) {
    const key = container.dataset.list;
    const kind = container.dataset.kind;
    container.innerHTML = '';
    content[key].forEach((value, i) => {
        const row = document.createElement('div');
        row.className = 'list-row';
        const field = document.createElement(kind);
        if (kind === 'textarea') field.rows = 3;
        field.value = value;
        field.oninput = () => { content[key][i] = field.value; markDirty(); };
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'icon-btn';
        remove.title = 'Xoá';
        remove.textContent = '✕';
        remove.onclick = () => { content[key].splice(i, 1); renderList(container); markDirty(); };
        row.append(field, remove);
        container.append(row);
    });
    growAll();
}

// Ảnh dùng ô thứ i: ảnh i, i + số ô, i + 2×số ô, ...
function photosForCaption(i) {
    const n = content.photoCaptions.length;
    return photos.filter((_, p) => p % n === i);
}

function renderCaptions() {
    const box = $('#captions');
    box.innerHTML = '';
    content.photoCaptions.forEach((cap, i) => {
        const row = document.createElement('div');
        row.className = 'caption-row';

        const thumbs = document.createElement('div');
        thumbs.className = 'thumbs';
        const used = photosForCaption(i);
        if (used.length) {
            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = `./anh/${encodeURIComponent(used[0])}`;
            img.alt = used[0];
            thumbs.append(img);
            if (used.length > 1) {
                const more = document.createElement('span');
                more.textContent = `+${used.length - 1}`;
                thumbs.append(more);
            }
        } else {
            thumbs.textContent = `#${i + 1}`;
        }

        const fields = document.createElement('div');
        fields.className = 'caption-fields';
        const title = document.createElement('input');
        title.placeholder = `Tiêu đề ảnh ${i + 1}`;
        title.value = cap.title;
        title.oninput = () => { cap.title = title.value; markDirty(); };
        const text = document.createElement('textarea');
        text.rows = 2;
        text.placeholder = 'Lời anh muốn nhắn (để trống thì dùng lời có sẵn)';
        text.value = cap.text;
        text.oninput = () => { cap.text = text.value; markDirty(); };
        fields.append(title, text);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'icon-btn';
        remove.title = 'Xoá ô này';
        remove.textContent = '✕';
        remove.onclick = () => { content.photoCaptions.splice(i, 1); renderCaptions(); markDirty(); };

        row.append(thumbs, fields, remove);
        box.append(row);
    });

    const fill = $('#btn-fill-captions');
    const missing = photos.length - content.photoCaptions.length;
    fill.hidden = missing <= 0;
    fill.textContent = `Tạo đủ mỗi ảnh một ô (${photos.length} ảnh)`;
    growAll();
}

// Ô nhập nhiều dòng tự cao theo chữ, để đọc hết lời mà không phải cuộn trong ô
function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
}
document.addEventListener('input', (e) => {
    if (e.target instanceof HTMLTextAreaElement) autoGrow(e.target);
});
const growAll = () => requestAnimationFrame(() => document.querySelectorAll('textarea').forEach(autoGrow));
window.addEventListener('resize', growAll);
document.fonts?.ready.then(growAll);

function renderAll() {
    document.querySelectorAll('[data-field]').forEach(bindField);
    document.querySelectorAll('[data-list]').forEach(renderList);
    renderCaptions();
    growAll();
}

/* ---------- Hành động ---------- */
document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.onclick = () => {
        const key = btn.dataset.add;
        content[key].push('');
        renderList(document.querySelector(`[data-list="${key}"]`));
        markDirty();
    };
});

$('#btn-add-caption').onclick = () => {
    content.photoCaptions.push({ title: '', text: '' });
    renderCaptions();
    markDirty();
};

$('#btn-fill-captions').onclick = () => {
    while (content.photoCaptions.length < photos.length) content.photoCaptions.push({ title: '', text: '' });
    renderCaptions();
    markDirty();
};

$('#btn-reset').onclick = () => {
    if (!confirm('Đưa tất cả về lời mặc định? Những gì đang gõ sẽ mất.')) return;
    content = structuredClone(DEFAULT_CONTENT);
    renderAll();
    markDirty();
};

$('#btn-download').onclick = () => {
    const blob = new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = FILE;
    a.click();
    URL.revokeObjectURL(a.href);
};

$('#btn-preview').onclick = () => {
    store.set(PREVIEW_KEY, JSON.stringify(content));
    window.open('./?xem-thu', '_blank');
};

async function connect() {
    if (!tokenInput.value.trim()) return;
    setStatus('Đang kết nối GitHub...');
    try {
        const { data } = await fetchRemote();
        store.set(TOKEN_KEY, tokenInput.value.trim());
        $('#token-state').textContent = 'đã kết nối';
        $('#token-state').classList.add('ok');
        // Lấy bản mới nhất trên GitHub nếu chưa sửa gì, tránh đè mất lời vừa lưu ở máy khác
        if (!dirty && data) {
            content = mergeContent(data);
            renderAll();
        }
        setStatus('Đã kết nối GitHub ✅', 'ok');
    } catch (err) {
        $('#token-state').textContent = 'chưa kết nối';
        $('#token-state').classList.remove('ok');
        setStatus(err.message, 'error');
    }
}
$('#btn-connect').onclick = connect;

$('#btn-save').onclick = async () => {
    if (!tokenInput.value.trim()) {
        setStatus('Dán token GitHub ở mục 🔑 trên cùng trước đã nha.', 'error');
        $('#token-card').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    const btn = $('#btn-save');
    btn.disabled = true;
    setStatus('Đang lưu lên GitHub...');
    try {
        const { sha } = await fetchRemote();
        const res = await github('PUT', {
            message: 'content: update gift wishes',
            content: toBase64(JSON.stringify(content, null, 2) + '\n'),
            branch: BRANCH,
            ...(sha ? { sha } : {}),
        });
        if (!res.ok) throw new Error(`GitHub báo lỗi ${res.status}`);
        store.set(TOKEN_KEY, tokenInput.value.trim());
        dirty = false;
        setStatus('Đã lưu ✅ Khoảng 1–2 phút nữa trang sẽ cập nhật.', 'ok');
    } catch (err) {
        setStatus(`Chưa lưu được: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
    }
};

window.addEventListener('beforeunload', (e) => {
    if (dirty) e.preventDefault();
});

/* ---------- Khởi động ---------- */
async function init() {
    try {
        const res = await fetch('./anh/danh-sach.json', { cache: 'no-store' });
        photos = res.ok ? await res.json() : [];
    } catch {
        photos = [];
    }
    content = await loadContent();
    renderAll();

    const saved = store.get(TOKEN_KEY);
    if (saved) {
        tokenInput.value = saved;
        connect();
    }
}
init();
