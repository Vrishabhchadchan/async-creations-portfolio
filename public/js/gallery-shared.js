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

  function galleryTileHTML(item, opts = {}) {
    const sizeClass = item.size && item.size !== 'normal' ? ' ' + item.size : '';
    const mediaHTML = item.imageUrl
      ? `<div class="tile-media" style="background-image:url('${escapeAttr(item.imageUrl)}')"></div>`
      : `<div class="tile-media placeholder-tile ${escapeAttr(item.placeholderVariant || 'ph-1')}">${PLACEHOLDER_ICON}</div>`;

    const deleteBtn = opts.editable
      ? `<button type="button" class="tile-delete" data-id="${escapeAttr(item.id)}" aria-label="Delete photo">${CLOSE_ICON}</button>`
      : '';

    return `<div class="gallery-item${sizeClass}" data-cat="${escapeAttr(item.category)}" data-id="${escapeAttr(item.id)}">
      ${mediaHTML}
      <span class="tile-plus">${PLUS_ICON}</span>
      ${deleteBtn}
      <div class="tile-overlay"><span class="tile-cat">${escapeHtml(item.categoryLabel)}</span><span class="tile-title">${escapeHtml(item.title)}</span></div>
    </div>`;
  }

  global.GalleryShared = { galleryTileHTML, escapeHtml, escapeAttr };
})(window);
