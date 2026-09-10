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
          gap: 9px;
          width: 100%;
          min-height: 46px;
          padding: 9px 12px;
          border-radius: 15px;
          border: 1px solid rgba(160, 205, 255, .70) !important;
          background:
            linear-gradient(135deg, rgba(255,255,255,.22), rgba(139,92,246,.10) 48%, rgba(59,130,246,.16)) !important;
          color: #fff !important;
          box-shadow:
            inset 0 1px rgba(255,255,255,.38),
            inset 0 -1px rgba(255,255,255,.08),
            0 8px 24px rgba(34, 115, 220, .18),
            0 0 22px rgba(103,232,249,.08);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);
          font-weight: 850;
          font-size: 12px;
          text-align: center;
          text-shadow: 0 1px 8px rgba(0,0,0,.25);
          transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;
        }

        .desktop-buy.mobile-amazon-buy:hover {
          background:
            linear-gradient(135deg, rgba(255,255,255,.28), rgba(139,92,246,.14) 48%, rgba(59,130,246,.20)) !important;
          color: #fff !important;
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow:
            inset 0 1px rgba(255,255,255,.42),
            0 10px 28px rgba(34, 115, 220, .24),
            0 0 28px rgba(103,232,249,.10);
        }

        .mobile-amazon-buy-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 0;
        }

        .mobile-amazon-buy-content img {
          width: 22px;
          height: 22px;
          display: block;
          flex: 0 0 22px;
          object-fit: contain;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,.18);
        }

        .mobile-amazon-buy-content span:last-child {
          white-space: nowrap;
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
