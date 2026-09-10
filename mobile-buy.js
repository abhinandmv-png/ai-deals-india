(() => {
  const STYLE_ID = "mobile-amazon-buy-style-v2";
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
          min-height: 40px !important;
          padding: 6px 9px !important;
          border-radius: 14px !important;
          border: 1px solid rgba(145, 190, 245, .72) !important;
          background: linear-gradient(135deg, rgba(255,255,255,.21), rgba(77,99,154,.24) 52%, rgba(43,91,164,.24)) !important;
          color: #fff !important;
          box-shadow: inset 0 1px rgba(255,255,255,.30), 0 7px 18px rgba(31,91,170,.17), 0 0 17px rgba(84,170,255,.07);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          font-weight: 850;
          font-size: 11px !important;
          line-height: 1;
          white-space: nowrap;
          text-align: center;
          text-shadow: 0 1px 7px rgba(0,0,0,.25);
          box-sizing: border-box;
        }

        .desktop-buy.mobile-amazon-buy:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .mobile-amazon-buy-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-width: 0;
        }

        .mobile-amazon-buy-content img {
          width: 22px !important;
          height: 22px !important;
          flex: 0 0 22px !important;
          display: block;
          object-fit: cover;
          border-radius: 6px;
          background: #ff9900;
          box-shadow: 0 2px 8px rgba(0,0,0,.20);
        }

        .mobile-amazon-buy-content span:last-child {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          <span>Buy at Amazon →</span>
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
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
