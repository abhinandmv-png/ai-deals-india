(() => {
  const MOBILE_MAX = 560;
  const PER_PAGE = 10;
  let page = 1;
  let observer = null;
  let scheduled = false;

  function isMobile() {
    return window.matchMedia(`(max-width:${MOBILE_MAX}px)`).matches;
  }

  function ensurePager() {
    let pager = document.getElementById('mobileDealPagination');
    if (pager) return pager;
    const grid = document.getElementById('dealGrid');
    if (!grid) return null;
    pager = document.createElement('nav');
    pager.id = 'mobileDealPagination';
    pager.className = 'mobile-deal-pagination';
    pager.setAttribute('aria-label', 'Deal pages');
    grid.insertAdjacentElement('afterend', pager);
    return pager;
  }

  function renderPager() {
    if (!isMobile()) return;
    const grid = document.getElementById('dealGrid');
    const pager = ensurePager();
    if (!grid || !pager) return;

    const cards = Array.from(grid.querySelectorAll('.deal-card'));
    const pages = Math.max(1, Math.ceil(cards.length / PER_PAGE));
    page = Math.min(Math.max(1, page), pages);

    cards.forEach((card, i) => {
      const visible = i >= (page - 1) * PER_PAGE && i < page * PER_PAGE;
      card.style.display = visible ? '' : 'none';
    });

    if (pages <= 1) {
      pager.innerHTML = '';
      pager.hidden = true;
      return;
    }

    pager.hidden = false;
    const items = [];
    for (let n = 1; n <= pages; n++) {
      items.push(`<button type="button" class="mobile-page-number${n === page ? ' active' : ''}" data-page="${n}" aria-label="Page ${n}"${n === page ? ' aria-current="page"' : ''}>${n}</button>`);
    }
    pager.innerHTML = items.join('');
    pager.querySelectorAll('.mobile-page-number').forEach(btn => {
      btn.addEventListener('click', () => {
        page = Number(btn.dataset.page) || 1;
        renderPager();
        const deals = document.getElementById('deals');
        if (deals) window.scrollTo({top: deals.getBoundingClientRect().top + window.scrollY - 12, behavior: 'smooth'});
      });
    });
  }

  function scheduleRender() {
    if (!isMobile() || scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      renderPager();
    });
  }

  function init() {
    const grid = document.getElementById('dealGrid');
    if (!grid) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(scheduleRender);
    observer.observe(grid, {childList: true, subtree: true});
    window.addEventListener('resize', scheduleRender, {passive: true});
    scheduleRender();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
