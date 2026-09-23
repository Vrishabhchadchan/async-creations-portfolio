/* Shared between the public site (js/main.js) and the team portal
   (team-portal/main.js) so both render gallery tiles identically. */
(function (global) {
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, '&#96;');
  }

  const PLACEHOLDER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  const PLUS_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
  const CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  const DRAG_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="#fff" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="#fff" stroke="none"/></svg>';
  const EYE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.9 19.9 0 0 1 4.22-5.44M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a19.9 19.9 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  function galleryTileHTML(item, opts = {}) {
    const sizeClass = item.size && item.size !== 'normal' ? ' ' + item.size : '';
    const isHidden = item.visible === false;
    const hiddenClass = opts.editable && isHidden ? ' is-hidden' : '';
    const mediaHTML = item.imageUrl
      ? `<div class="tile-media" style="background-image:url('${escapeAttr(item.imageUrl)}')"></div>`
      : `<div class="tile-media placeholder-tile ${escapeAttr(item.placeholderVariant || 'ph-1')}">${PLACEHOLDER_ICON}</div>`;

    let adminHTML = '';
    if (opts.editable) {
      adminHTML = `
      <span class="tile-drag-handle" aria-label="Drag to reorder" title="Drag to reorder">${DRAG_ICON}</span>
      <button type="button" class="tile-visibility" data-id="${escapeAttr(item.id)}" data-visible="${isHidden ? 'false' : 'true'}" aria-label="${isHidden ? 'Show on live site' : 'Hide from live site'}" title="${isHidden ? 'Hidden — click to show on live site' : 'Visible — click to hide from live site'}">${isHidden ? EYE_OFF_ICON : EYE_ICON}</button>
      <button type="button" class="tile-delete" data-id="${escapeAttr(item.id)}" aria-label="Delete photo">${CLOSE_ICON}</button>
      ${isHidden ? '<span class="tile-hidden-badge">Hidden</span>' : ''}`;
    }

    return `<div class="gallery-item${sizeClass}${hiddenClass}" data-cat="${escapeAttr(item.category)}" data-id="${escapeAttr(item.id)}"${opts.editable ? ' draggable="true"' : ''}>
      ${mediaHTML}
      <span class="tile-plus">${PLUS_ICON}</span>
      ${adminHTML}
      <div class="tile-overlay"><span class="tile-cat">${escapeHtml(item.categoryLabel)}</span><span class="tile-title">${escapeHtml(item.title)}</span></div>
    </div>`;
  }

  global.GalleryShared = { galleryTileHTML, escapeHtml, escapeAttr };
})(window);
