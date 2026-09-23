const loginScreen = document.getElementById('loginScreen');
const portalApp = document.getElementById('portalApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const testiList = document.getElementById('testiList');
const portalToast = document.getElementById('portalToast');

const testiModal = document.getElementById('testiModal');
const addTestiBtn = document.getElementById('addTestiBtn');
const closeTestiModalBtn = document.getElementById('closeTestiModalBtn');
const testiForm = document.getElementById('testiForm');
const testiSubmitBtn = document.getElementById('testiSubmitBtn');
const testiError = document.getElementById('testiError');
const testiStarPicker = document.getElementById('testiStarPicker');

const confirmModal = document.getElementById('confirmModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');

let currentItems = [];
let confirmResolver = null;
let pickedRating = 0;

const STAR_PATH = 'M12 2.5l2.95 6.28 6.83.77-5.1 4.72 1.4 6.79L12 17.9l-6.08 3.16 1.4-6.79-5.1-4.72 6.83-.77L12 2.5z';
const EYE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 4.22-5.44M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
const CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
const DRAG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="#fff" stroke="none"/></svg>';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    `<svg viewBox="0 0 24 24" width="15" height="15" fill="${i < rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="${STAR_PATH}"/></svg>`
  )).join('');
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
  loadTestimonials();
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

function testiCardHTML(item) {
  const isHidden = item.visible === false;
  return `<div class="testi-card${isHidden ? ' is-hidden' : ''}" data-id="${escapeHtml(item.id)}" draggable="true">
    <span class="tile-drag-handle testi-drag-handle" aria-label="Drag to reorder" title="Drag to reorder">${DRAG_ICON}</span>
    <div class="testi-card-body">
      <div class="testi-card-top">
        <div class="star-rating">${starsHTML(item.rating)}</div>
        ${isHidden ? '<span class="tile-hidden-badge testi-pending-badge">Pending</span>' : ''}
      </div>
      <p class="testi-card-quote">&ldquo;${escapeHtml(item.quote)}&rdquo;</p>
      <div class="testi-card-foot">
        <b>${escapeHtml(item.name)}</b>
        ${item.role ? `<span>${escapeHtml(item.role)}</span>` : ''}
      </div>
    </div>
    <div class="testi-card-actions">
      <button type="button" class="tile-visibility testi-visibility" data-id="${escapeHtml(item.id)}" data-visible="${isHidden ? 'false' : 'true'}" aria-label="${isHidden ? 'Approve & show on live site' : 'Hide from live site'}" title="${isHidden ? 'Pending — click to approve and show' : 'Visible — click to hide'}">${isHidden ? EYE_OFF_ICON : EYE_ICON}</button>
      <button type="button" class="tile-delete testi-delete" data-id="${escapeHtml(item.id)}" aria-label="Delete review">${CLOSE_ICON}</button>
    </div>
  </div>`;
}

function renderList(items) {
  currentItems = items;
  if (!items.length) {
    testiList.innerHTML = '<div class="gallery-loading">No reviews yet — add one, or wait for a client to submit through the site.</div>';
    return;
  }
  testiList.innerHTML = items.map(testiCardHTML).join('');

  testiList.querySelectorAll('.testi-delete').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.getAttribute('data-id')));
  });
  testiList.querySelectorAll('.testi-visibility').forEach((btn) => {
    btn.addEventListener('click', () => handleToggleVisibility(btn.getAttribute('data-id'), btn.getAttribute('data-visible') !== 'true'));
  });
  wireDragAndDrop();
}

async function loadTestimonials() {
  testiList.innerHTML = '<div class="gallery-loading">Loading reviews&hellip;</div>';
  try {
    const res = await fetch('/api/testimonials');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load reviews');
    renderList(data.items || []);
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    testiList.innerHTML = '';
    showToast('Could not load reviews. Try refreshing.', 'error');
  }
}

async function handleDelete(id) {
  if (!id) return;
  const confirmed = await askConfirm();
  if (!confirmed) return;
  try {
    const res = await fetch('/api/testimonials-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    renderList(data.items || []);
    showToast('Review removed.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

async function handleToggleVisibility(id, nextVisible) {
  if (!id) return;
  try {
    const res = await fetch('/api/testimonials-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, visible: nextVisible }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update visibility');
    renderList(data.items || []);
    showToast(nextVisible ? 'Review approved and live on the site.' : 'Review hidden from the live site.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
  }
}

// ===== Drag-and-drop reordering (mirrors the photo manager's approach) =====
let dragSourceId = null;

function wireDragAndDrop() {
  const cards = testiList.querySelectorAll('.testi-card');
  cards.forEach((card) => {
    card.addEventListener('dragstart', () => {
      dragSourceId = card.getAttribute('data-id');
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      testiList.querySelectorAll('.testi-card.drag-over').forEach((el) => el.classList.remove('drag-over'));
      dragSourceId = null;
    });
    card.addEventListener('dragover', (e) => {
      if (!dragSourceId || dragSourceId === card.getAttribute('data-id')) return;
      e.preventDefault();
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
  renderList(items);

  try {
    const res = await fetch('/api/testimonials-reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save the new order');
    renderList(data.items || []);
    showToast('New order saved.');
  } catch (err) {
    if (String(err.message).includes('log in')) return showLogin();
    showToast(err.message, 'error');
    loadTestimonials();
  }
}

// ===== Add-testimonial modal =====
function renderStarPicker() {
  testiStarPicker.innerHTML = [1, 2, 3, 4, 5].map((n) => (
    `<button type="button" role="radio" aria-checked="${pickedRating === n}" aria-label="${n} star${n > 1 ? 's' : ''}" data-n="${n}" style="color:${n <= pickedRating ? 'var(--purple)' : 'var(--text-faint)'}">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="${n <= pickedRating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="${STAR_PATH}"/></svg>
    </button>`
  )).join('');
  testiStarPicker.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      pickedRating = Number(btn.getAttribute('data-n'));
      renderStarPicker();
    });
  });
}

function openTestiModal() {
  testiForm.reset();
  testiError.textContent = '';
  pickedRating = 0;
  renderStarPicker();
  testiModal.classList.add('open');
}

function closeTestiModal() {
  testiModal.classList.remove('open');
}

addTestiBtn.addEventListener('click', openTestiModal);
closeTestiModalBtn.addEventListener('click', closeTestiModal);
testiModal.addEventListener('click', (e) => { if (e.target === testiModal) closeTestiModal(); });

testiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  testiError.textContent = '';
  const name = document.getElementById('testiName').value.trim();
  const role = document.getElementById('testiRole').value.trim();
  const quote = document.getElementById('testiQuote').value.trim();

  if (!name) { testiError.textContent = 'Please add the client’s name.'; return; }
  if (!pickedRating) { testiError.textContent = 'Please choose a star rating.'; return; }
  if (!quote) { testiError.textContent = 'Please add their feedback.'; return; }

  testiSubmitBtn.disabled = true;
  testiSubmitBtn.textContent = 'Saving…';

  try {
    const res = await fetch('/api/testimonials-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, quote, rating: pickedRating }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save testimonial');
    renderList(data.items || []);
    closeTestiModal();
    showToast('Testimonial published to the live site.');
  } catch (err) {
    if (String(err.message).includes('log in')) { closeTestiModal(); return showLogin(); }
    testiError.textContent = err.message || 'Could not save. Please try again.';
  } finally {
    testiSubmitBtn.disabled = false;
    testiSubmitBtn.textContent = 'Save testimonial';
  }
});

checkSession();
