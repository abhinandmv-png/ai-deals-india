(() => {
  const PER_PAGE = 30;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const requestUrl = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
    if (!/deals\.json(?:\?|$)/i.test(requestUrl)) return nativeFetch(...args);
    const response = await nativeFetch(...args);
    if (!response.ok) return response;
    try {
      const data = await response.clone().json();
      if (!Array.isArray(data.deals)) return response;
      const deals = data.deals;
      const requested = Math.max(1, parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);
      const pages = Math.max(1, Math.ceil(deals.length / PER_PAGE));
      const page = Math.min(requested, pages);
      data.deals = deals.slice((page - 1) * PER_PAGE, page * PER_PAGE);
      data._pagination = { page, pages, total: deals.length, per_page: PER_PAGE };
      queueMicrotask(() => renderPagination(page, pages, deals.length));
      return new Response(JSON.stringify(data), {status: response.status, statusText: response.statusText, headers: {'Content-Type':'application/json'}});
    } catch (_) { return response; }
  };

  function renderPagination(page, pages, total) {
    let nav = document.getElementById('dealPagination');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'dealPagination';
      nav.className = 'deal-pagination';
      nav.setAttribute('aria-label', 'Deal pages');
      const grid = document.getElementById('dealGrid');
      if (grid) grid.insertAdjacentElement('afterend', nav);
    }
    if (!nav || pages <= 1) { if (nav) nav.innerHTML = ''; return; }
    const make = (n, label = String(n), active = false) => active ? `<span class="page-current" aria-current="page">${label}</span>` : `<a href="?page=${n}" aria-label="Go to deal page ${n}">${label}</a>`;
    const parts = [];
    if (page > 1) parts.push(make(page - 1, '←'));
    const start = Math.max(1, page - 2), end = Math.min(pages, page + 2);
    if (start > 1) { parts.push(make(1)); if (start > 2) parts.push('<span class="page-dots">…</span>'); }
    for (let n = start; n <= end; n++) parts.push(make(n, String(n), n === page));
    if (end < pages) { if (end < pages - 1) parts.push('<span class="page-dots">…</span>'); parts.push(make(pages)); }
    if (page < pages) parts.push(make(page + 1, '→'));
    nav.innerHTML = parts.join('');
    nav.dataset.total = total;
  }
})();
