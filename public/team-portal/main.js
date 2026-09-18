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
  <span class="add-tile-label">Add Photo</span>
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
    const match = filter === 'all' || item.getAttribute('data-cat') === filter;
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
  applyFilter();
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
  uploadPreviewImg.src = '';
  const filter = activeFilter();
  if (filter !== 'all') {
    document.getElementById('photoCategory').value = filter;
  }
  uploadModal.classList.add('open');
}

function closeModal() {
  uploadModal.classList.remove('open');
}

closeModalBtn.addEventListener('click', closeModal);
uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) closeModal(); });

photoFile.addEventListener('change', () => {
  const file = photoFile.files[0];
  if (!file) { uploadPreview.hidden = true; return; }
  uploadPreviewImg.src = URL.createObjectURL(file);
  uploadPreview.hidden = false;
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadError.textContent = '';
  const file = photoFile.files[0];
  const category = document.getElementById('photoCategory').value;
  const title = document.getElementById('photoTitle').value.trim();
  const size = document.getElementById('photoSize').value;

  if (!file) { uploadError.textContent = 'Please choose a photo.'; return; }
  if (!title) { uploadError.textContent = 'Please add a title.'; return; }

  uploadSubmitBtn.disabled = true;
  uploadSubmitBtn.textContent = 'Uploading…';

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const blob = await upload(`gallery/photos/${Date.now()}-${safeName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      contentType: file.type,
    });

    const res = await fetch('/api/gallery-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: blob.url, category, title, size }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save photo');

    renderGallery(data.items || []);
    closeModal();
    showToast('Photo published to the live site.');
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
