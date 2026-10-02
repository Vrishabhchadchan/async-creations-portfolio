import { upload } from 'https://esm.sh/@vercel/blob@0.27.1/client';

const loginScreen = document.getElementById('loginScreen');
const portalApp = document.getElementById('portalApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const clientList = document.getElementById('clientList');
const portalToast = document.getElementById('portalToast');

const clientModal = document.getElementById('clientModal');
const addClientBtn = document.getElementById('addClientBtn');
const closeClientModalBtn = document.getElementById('closeClientModalBtn');
const clientForm = document.getElementById('clientForm');
const clientSubmitBtn = document.getElementById('clientSubmitBtn');
const clientError = document.getElementById('clientError');
const clientLogoFile = document.getElementById('clientLogoFile');
const clientLogoPreview = document.getElementById('clientLogoPreview');
const clientLogoPreviewImg = document.getElementById('clientLogoPreviewImg');

const confirmModal = document.getElementById('confirmModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

let currentItems = [];
let confirmResolver = null;

const EYE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 4.22-5.44M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
const CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
const DRAG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="#fff" stroke="none"/></svg>';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function askConfirm() {
  confirmModal.classList.add('open');
  return new Promise((resolve) => { confirmResolver = resolve; });
}

function settleConfirm(result) {
  confirmModal.classList.remove('open');
  if (confirmResolver) { confirmResolver(result); confirmResolver = null; }
}

confirmYesBtn.addEventListener('click', () => settleConfirm(true));
confirmNoBtn.addEventListener('click', () => settleConfirm(false));
confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) settleConfirm(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && confirmModal.classList.contains('open')) settleConfirm(false);
});

function showToast(message, type = 'success') {
  portalToast.textContent = message;
  portalToast.className = `portal-toast show ${type}`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => portalToast.classList.remove('show'), 4000);
}

function showPortal() {
  loginScreen.hidden = true;
  portalApp.hidden = false;
  loadClients();
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
    if (!res.ok) throw new Error(data.error || 'Login failed');
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

async function loadClients() {
  clientList.innerHTML = '<div class="gallery-loading">Loading clients…</div>';
  try {
    const res = await fetch('/api/clients');
    const data = await res.json();
    renderClients(data.items || []);
  } catch {
    showToast('Could not load clients. Try refreshing.', 'error');
  }
}

function renderClients(items) {
  currentItems = items;
  if (!items.length) {
    clientList.innerHTML = '<p class="testi-empty">No client logos added yet. Click "+ Add a client logo" below to get started.</p>';
    return;
  }

  clientList.innerHTML = items.map((item) => {
    const isVis = item.visible !== false;
    return `
      <div class="client-portal-item ${isVis ? '' : 'is-hidden'}" data-id="${escapeHtml(item.id)}" draggable="true">
        <button type="button" class="client-drag-handle" title="Drag to reorder">${DRAG_ICON}</button>
        <div class="client-thumb-box">
          <img src="${escapeHtml(item.logoUrl)}" alt="${escapeHtml(item.name)}" class="client-thumb-img" />
        </div>
        <div class="client-meta-box">
          <b class="client-portal-name">${escapeHtml(item.name)}</b>
          ${item.website ? `<a href="${escapeHtml(item.website)}" target="_blank" rel="noopener" class="client-portal-link">${escapeHtml(item.website)}</a>` : ''}
        </div>
        <span class="portal-badge ${isVis ? 'badge-live' : 'badge-hidden'}">${isVis ? 'Live on Home' : 'Hidden'}</span>
        <div class="client-actions-box">
          <button type="button" class="tile-btn client-vis-btn" data-id="${escapeHtml(item.id)}" data-visible="${isVis}" title="${isVis ? 'Hide from homepage' : 'Show on homepage'}">
            ${isVis ? EYE_ICON : EYE_OFF_ICON}
          </button>
          <button type="button" class="tile-btn client-del-btn" data-id="${escapeHtml(item.id)}" title="Remove client logo">
            ${CLOSE_ICON}
          </button>
        </div>
      </div>
    `;
  }).join('');

  clientList.querySelectorAll('.client-vis-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const nextVisible = btn.getAttribute('data-visible') !== 'true';
      handleToggleVisibility(id, nextVisible);
    });
  });

  clientList.querySelectorAll('.client-del-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(btn.getAttribute('data-id'));
    });
  });

  wireDragAndDrop();
}

async function handleToggleVisibility(id, nextVisible) {
  if (!id) return;
  try {
    const res = await fetch('/api/clients-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, visible: nextVisible }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update visibility');
    renderClients(data.items || []);
    showToast(nextVisible ? 'Logo is now visible on the homepage.' : 'Logo is hidden from the homepage.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

async function handleDelete(id) {
  if (!id) return;
  const confirmed = await askConfirm();
  if (!confirmed) return;
  try {
    const res = await fetch('/api/clients-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    renderClients(data.items || []);
    showToast('Client logo removed.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

let dragSourceId = null;

function wireDragAndDrop() {
  const cards = clientList.querySelectorAll('.client-portal-item');
  cards.forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      dragSourceId = card.getAttribute('data-id');
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', dragSourceId); } catch {}
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      clientList.querySelectorAll('.client-portal-item.drag-over').forEach((el) => el.classList.remove('drag-over'));
      dragSourceId = null;
    });
    card.addEventListener('dragover', (e) => {
      if (!dragSourceId || dragSourceId === card.getAttribute('data-id')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const targetId = card.getAttribute('data-id');
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

  renderClients(items);

  try {
    const res = await fetch('/api/clients-reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save the new order');
    renderClients(data.items || []);
    showToast('New order saved.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
    loadClients();
  }
}

// Modal handling
function openModal() {
  clientForm.reset();
  clientError.textContent = '';
  clientLogoPreview.hidden = true;
  clientLogoPreviewImg.src = '';
  clientModal.classList.add('open');
}

function closeModal() {
  clientModal.classList.remove('open');
}

addClientBtn.addEventListener('click', openModal);
closeClientModalBtn.addEventListener('click', closeModal);
clientModal.addEventListener('click', (e) => { if (e.target === clientModal) closeModal(); });

clientLogoFile.addEventListener('change', () => {
  const file = clientLogoFile.files[0];
  if (!file) { clientLogoPreview.hidden = true; return; }
  clientLogoPreviewImg.src = URL.createObjectURL(file);
  clientLogoPreview.hidden = false;
});

clientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clientError.textContent = '';
  const file = clientLogoFile.files[0];
  const name = document.getElementById('clientName').value.trim();
  const website = document.getElementById('clientWebsite').value.trim();

  if (!file) { clientError.textContent = 'Please choose a logo image.'; return; }
  if (!name) { clientError.textContent = 'Please enter the client name.'; return; }

  clientSubmitBtn.disabled = true;
  clientSubmitBtn.textContent = 'Uploading…';

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const blob = await upload(`clients/logos/${Date.now()}-${safeName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      contentType: file.type,
    });

    const res = await fetch('/api/clients-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, logoUrl: blob.url, website }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save client');

    closeModal();
    renderClients(data.items || []);
    showToast('Client logo uploaded and published to homepage.');
  } catch (err) {
    clientError.textContent = err.message;
  } finally {
    clientSubmitBtn.disabled = false;
    clientSubmitBtn.textContent = 'Upload & Add Client';
  }
});

checkSession();
