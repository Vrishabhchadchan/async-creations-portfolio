import { upload } from 'https://esm.sh/@vercel/blob@0.27.1/client';

const loginScreen = document.getElementById('loginScreen');
const portalApp = document.getElementById('portalApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const portalGallery = document.getElementById('portalGallery');
const portalToast = document.getElementById('portalToast');

const uploadModal = document.getElementById('uploadModal');
const addTileBtn = document.getElementById('addTileBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const uploadForm = document.getElementById('uploadForm');
const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
const uploadError = document.getElementById('uploadError');
const photoFile = document.getElementById('photoFile');
const uploadPreview = document.getElementById('uploadPreview');
const uploadPreviewImg = document.getElementById('uploadPreviewImg');
const portalFilterRow = document.getElementById('portalFilterRow');
const filterBtns = portalFilterRow.querySelectorAll('.filter-btn');

const confirmModal = document.getElementById('confirmModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

let currentItems = [];
let confirmResolver = null;

function askConfirm() {
  confirmModal.classList.add('open');
  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function settleConfirm(result) {
  confirmModal.classList.remove('open');
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

confirmYesBtn.addEventListener('click', () => settleConfirm(true));
confirmNoBtn.addEventListener('click', () => settleConfirm(false));
confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) settleConfirm(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && confirmModal.classList.contains('open')) settleConfirm(false);
});

const ADD_TILE_HTML = `<button type="button" class="gallery-item add-tile" id="addTileBtn">
  <span class="add-tile-plus">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </span>
  <span class="add-tile-label">Add Photo / Video</span>
</button>`;

function showToast(message, type = 'success') {
  portalToast.textContent = message;
  portalToast.className = `portal-toast show ${type}`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => portalToast.classList.remove('show'), 4000);
}

function showPortal() {
  loginScreen.hidden = true;
  portalApp.hidden = false;
  loadGallery();
}

function showLogin() {
  portalApp.hidden = true;
  loginScreen.hidden = false;
}

async function checkSession() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    if (data.authenticated) showPortal();
    else showLogin();
  } catch {
    showLogin();
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Checking…';
  try {
    const passcode = document.getElementById('passcode').value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Incorrect passcode');
    loginForm.reset();
    showPortal();
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Enter Portal';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  showLogin();
});

function activeFilter() {
  return portalFilterRow.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
}

function applyFilter() {
  const filter = activeFilter();
  portalGallery.querySelectorAll('.gallery-item:not(.add-tile)').forEach((item) => {
    const cat = item.getAttribute('data-cat');
    let match = false;
    if (filter === 'all') match = true;
    else if (filter === 'drone' || filter === 'droneshoot') match = (cat === 'drone' || cat === 'droneshoot');
    else match = (cat === filter);
    item.classList.toggle('hide', !match);
  });
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter();
  });
});

function renderGallery(items) {
  currentItems = items;
  const tiles = items.map((item) => window.GalleryShared.galleryTileHTML(item, { editable: true })).join('');
  portalGallery.innerHTML = ADD_TILE_HTML + tiles;
  document.getElementById('addTileBtn').addEventListener('click', openModal);
  portalGallery.querySelectorAll('.tile-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(btn.getAttribute('data-id'));
    });
  });
  portalGallery.querySelectorAll('.tile-visibility').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleToggleVisibility(btn.getAttribute('data-id'), btn.getAttribute('data-visible') !== 'true');
    });
  });
  portalGallery.querySelectorAll('.tile-home').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.disabled) return;
      handleToggleHome(btn.getAttribute('data-id'), btn.getAttribute('data-on-home') !== 'true');
    });
  });
  wireDragAndDrop();
  applyFilter();
  updateHomeCount(items);
}

// Keep in step with HOME_MAX in lib/manifest.ts (the server enforces it).
const HOME_MAX = 6;

function updateHomeCount(items) {
  const el = document.getElementById('homeCount');
  if (!el) return;
  const chosen = items.filter((i) => i.onHome === true && i.visible !== false && i.imageUrl).length;
  el.classList.toggle('is-full', chosen >= HOME_MAX);
  el.textContent = chosen
    ? `Home page: ${chosen} of ${HOME_MAX} photos chosen. Hover a photo and use the house icon to add or remove one.`
    : `Home page: no photos chosen yet, so it shows your ${HOME_MAX} newest photos. Hover a photo and use the house icon to choose.`;
}

async function handleToggleHome(id, nextOnHome) {
  if (!id) return;
  try {
    const res = await fetch('/api/gallery-home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, onHome: nextOnHome }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update the home page');
    renderGallery(data.items || []);
    showToast(nextOnHome ? 'Photo added to the home page.' : 'Photo removed from the home page.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

async function handleToggleVisibility(id, nextVisible) {
  if (!id) return;
  try {
    const res = await fetch('/api/gallery-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, visible: nextVisible }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update visibility');
    renderGallery(data.items || []);
    showToast(nextVisible ? 'Photo is now visible on the live site.' : 'Photo hidden from the live site.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

// ===== Drag-and-drop reordering =====
// Reordering acts on the underlying currentItems array (not DOM position),
// so it works correctly even while a category filter is hiding other tiles.
let dragSourceId = null;

function wireDragAndDrop() {
  const tiles = portalGallery.querySelectorAll('.gallery-item:not(.add-tile)');
  tiles.forEach((tile) => {
    tile.addEventListener('dragstart', (e) => {
      dragSourceId = tile.getAttribute('data-id');
      tile.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragSourceId); } catch {}
    });
    tile.addEventListener('dragend', () => {
      tile.classList.remove('dragging');
      portalGallery.querySelectorAll('.gallery-item.drag-over').forEach((el) => el.classList.remove('drag-over'));
      dragSourceId = null;
    });
    tile.addEventListener('dragover', (e) => {
      if (!dragSourceId || dragSourceId === tile.getAttribute('data-id')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      tile.classList.add('drag-over');
    });
    tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'));
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.classList.remove('drag-over');
      const targetId = tile.getAttribute('data-id');
      if (!dragSourceId || dragSourceId === targetId) return;
      handleReorder(dragSourceId, targetId);
    });
  });
}

async function handleReorder(sourceId, targetId) {
  const items = currentItems.slice();
  const fromIndex = items.findIndex((i) => i.id === sourceId);
  const toIndex = items.findIndex((i) => i.id === targetId);
  if (fromIndex === -1 || toIndex === -1) return;

  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);

  // Reorder optimistically so the grid doesn't jump back while saving.
  renderGallery(items);

  try {
    const res = await fetch('/api/gallery-reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save the new order');
    renderGallery(data.items || []);
    showToast('New order saved.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
    loadGallery();
  }
}

async function loadGallery() {
  portalGallery.innerHTML = ADD_TILE_HTML + '<div class="gallery-loading">Loading current gallery…</div>';
  document.getElementById('addTileBtn').addEventListener('click', openModal);
  try {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    renderGallery(data.items || []);
  } catch {
    showToast('Could not load the gallery. Try refreshing.', 'error');
  }
}

async function handleDelete(id) {
  if (!id) return;
  const confirmed = await askConfirm();
  if (!confirmed) return;
  try {
    const res = await fetch('/api/gallery-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    renderGallery(data.items || []);
    showToast('Photo removed from the live site.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

function openModal() {
  uploadForm.reset();
  uploadError.textContent = '';
  uploadPreview.hidden = true;
  const previewImg = document.getElementById('uploadPreviewImg');
  const previewVid = document.getElementById('uploadPreviewVid');
  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
  if (previewVid) { previewVid.src = ''; previewVid.style.display = 'none'; }
  const filter = activeFilter();
  if (filter !== 'all') {
    document.getElementById('photoCategory').value = filter;
  }
  uploadModal.classList.add('open');
}

function closeModal() {
  uploadModal.classList.remove('open');
  const previewVid = document.getElementById('uploadPreviewVid');
  if (previewVid) { previewVid.pause(); previewVid.src = ''; }
}

closeModalBtn.addEventListener('click', closeModal);
uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) closeModal(); });

photoFile.addEventListener('change', () => {
  const file = photoFile.files[0];
  const previewImg = document.getElementById('uploadPreviewImg');
  const previewVid = document.getElementById('uploadPreviewVid');
  if (!file) {
    uploadPreview.hidden = true;
    previewImg.style.display = 'none';
    previewVid.style.display = 'none';
    return;
  }
  const isVideo = file.type.startsWith('video/');
  const objUrl = URL.createObjectURL(file);
  if (isVideo) {
    previewImg.style.display = 'none';
    previewImg.src = '';
    previewVid.src = objUrl;
    previewVid.style.display = 'block';
  } else {
    previewVid.style.display = 'none';
    previewVid.src = '';
    previewImg.src = objUrl;
    previewImg.style.display = 'block';
  }
  uploadPreview.hidden = false;
});

async function uploadMediaFile(file, folder) {
  // 1. Try Cloudflare R2 direct S3 presigned upload
  try {
    const presignRes = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder,
      }),
    });
    if (presignRes.ok) {
      const { uploadUrl, publicUrl } = await presignRes.json();
      if (uploadUrl && publicUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (uploadRes.ok) {
          return { url: publicUrl };
        }
        console.warn('R2 upload failed with status:', uploadRes.status, 'Falling back to blob.');
      }
    }
  } catch (r2Err) {
    console.warn('R2 upload attempt failed, falling back to blob:', r2Err);
  }

  // 2. Fallback to Vercel Blob
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const blob = await upload(`${folder}/${Date.now()}-${safeName}`, file, {
    access: 'public',
    handleUploadUrl: '/api/blob-upload',
    contentType: file.type,
  });
  return { url: blob.url };
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadError.textContent = '';
  const file = photoFile.files[0];
  const category = document.getElementById('photoCategory').value;
  const title = document.getElementById('photoTitle').value.trim();
  const size = document.getElementById('photoSize').value;
  const isVideo = file && file.type.startsWith('video/');

  if (!file) { uploadError.textContent = 'Please choose a photo or video.'; return; }
  if (!title) { uploadError.textContent = 'Please add a title.'; return; }

  uploadSubmitBtn.disabled = true;
  uploadSubmitBtn.textContent = isVideo ? 'Uploading video…' : 'Uploading…';

  try {
    const folder = isVideo ? 'gallery/videos' : 'gallery/photos';
    const media = await uploadMediaFile(file, folder);

    const body = isVideo
      ? { videoUrl: media.url, url: null, mediaType: 'video', category, title, size }
      : { url: media.url, mediaType: 'image', category, title, size };

    const res = await fetch('/api/gallery-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save media');

    renderGallery(data.items || []);
    closeModal();
    showToast(isVideo ? 'Video published to the live site.' : 'Photo published to the live site.');
  } catch (err) {
    if (String(err.message).includes('Unauthorized') || String(err.message).includes('log in')) {
      closeModal();
      return showLogin();
    }
    uploadError.textContent = err.message || 'Upload failed. Please try again.';
  } finally {
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.textContent = 'Upload & Publish';
  }
});

checkSession();
