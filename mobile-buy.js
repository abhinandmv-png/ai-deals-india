(() => {
  const STYLE_ID = "mobile-amazon-buy-style-v1";
  const AMAZON_HOST_RE = /(^|\.)amazon\.[a-z.]+$/i;

  function isMobile() {
    return window.matchMedia("(max-width: 560px)").matches;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width: 560px) {
        .desktop-buy.mobile-amazon-buy {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 46px;
          padding: 11px 14px;
          border-radius: 11px;
          border: 1px solid rgba(96, 165, 250, .55) !important;
          background: #2563eb !important;
          color: #fff !important;
          box-shadow: 0 10px 24px rgba(37, 99, 235, .28);
          font-weight: 850;
          font-size: 13px;
          text-align: center;
        }

        .desktop-buy.mobile-amazon-buy:hover {
          background: #1d4ed8 !important;
          color: #fff !important;
          transform: translateY(-1px);
        }

        .mobile-amazon-buy-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mobile-amazon-buy-content img {
          width: 18px;
          height: 18px;
          display: block;
          object-fit: contain;
          border-radius: 4px;
          background: #fff;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isAmazonLink(anchor) {
    try {
      const url = new URL(anchor.href, window.location.href);
      return AMAZON_HOST_RE.test(url.hostname);
    } catch (_) {
      return false;
    }
  }

  function syncButton(anchor) {
    if (!anchor.dataset.originalBuyHtml) {
      anchor.dataset.originalBuyHtml = anchor.innerHTML;
    }

    if (isMobile() && isAmazonLink(anchor)) {
      if (anchor.classList.contains("mobile-amazon-buy")) return;

      anchor.classList.add("mobile-amazon-buy");
      anchor.innerHTML = `
        <span class="mobile-amazon-buy-content">
          <img src="https://www.amazon.in/favicon.ico" alt="Amazon" loading="lazy" decoding="async">
          <span>Buy at Amazon</span>
        </span>
      `;
      return;
    }

    if (anchor.classList.contains("mobile-amazon-buy")) {
      anchor.classList.remove("mobile-amazon-buy");
      anchor.innerHTML = anchor.dataset.originalBuyHtml;
    }
  }

  function syncAll() {
    ensureStyles();
    document.querySelectorAll(".desktop-buy").forEach(syncButton);
  }

  function start() {
    syncAll();

    const grid = document.getElementById("dealGrid");
    if (grid) {
      const observer = new MutationObserver(() => syncAll());
      observer.observe(grid, { childList: true, subtree: true });
    }

    const media = window.matchMedia("(max-width: 560px)");
    const onChange = () => syncAll();
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
    } else {
      media.addListener(onChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
