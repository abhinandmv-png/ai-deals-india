const TELEGRAM_URL = "https://t.me/onlineshopingdeals_india";
const REFRESH_MS = 60000;
const MAX_DEALS = 500;
const IMAGE_LOAD_TIMEOUT_MS = 15000;
const MIN_USABLE_IMAGE_DIMENSION = 20;

// Image proxy used only when the original image URL fails.
const IMAGE_PROXY = "https://wsrv.nl/?url=";

const grid = document.getElementById("dealGrid");
const empty = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const lastUpdated = document.getElementById("lastUpdated");
const heroDealTitle = document.getElementById("heroDealTitle");
const heroProductImage = document.getElementById("heroProductImage");
const heroProductPrice = document.getElementById("heroProductPrice");
const showcaseImage = document.getElementById("showcaseImage");

let deals = [];
let feedUpdatedAt = null;

function postedLabel(deal) {
  const raw = deal.posted_at || deal.added_at || deal.published_at || deal.timestamp;
  if (!raw) return "Published time unavailable";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "Published time unavailable";
  const diff = Math.max(0, Date.now() - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + " min" + (mins === 1 ? "" : "s") + " ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + " hr" + (hours === 1 ? "" : "s") + " ago";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + " day" + (days === 1 ? "" : "s") + " ago";
  return date.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function money(v) {
  if (v === null || v === undefined || v === "") return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(v));
}

function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );
}

function iconFor(category = "") {
  const c = String(category || "").toLowerCase();

  if (c.includes("fashion") || c.includes("cloth")) return "👕";
  if (c.includes("beauty") || c.includes("personal")) return "✨";
  if (c.includes("elect")) return "🎧";
  if (c.includes("home")) return "🏠";
  if (c.includes("travel") || c.includes("luggage")) return "🧳";

  return "🛒";
}


/* =========================================================
   IMAGE URL HANDLING
   ========================================================= */

function imageUrlsFor(deal) {
  const urls = (Array.isArray(deal.image_fallbacks) ? [deal.image, ...deal.image_fallbacks] : [deal.image])
    .filter(url => typeof url === "string" && url.trim());
  const match = String(deal.url || "").match(/(?:dp|gp\/product\/|ASIN[=\/])([A-Z0-9]{10})/i);
  if (match) {
    const asin = match[1].toUpperCase();
    urls.push("https://m.media-amazon.com/images/P/" + asin + ".01._SL500_.jpg");
    urls.push("https://images-na.ssl-images-amazon.com/images/P/" + asin + ".01._SL500_.jpg");
    urls.push("https://m.media-amazon.com/images/P/" + asin + ".01.LZZZZZZZ.jpg");
  }
  const unique = [...new Set(urls)];
  const proxied = unique.filter(url => /^https?:\/\//i.test(url)).map(url => IMAGE_PROXY + encodeURIComponent(url));
  return [...unique, ...proxied];
}
function dealImage(deal) {
  const urls = imageUrlsFor(deal);
  const fallbackIcon = iconFor(deal.category);

  if (!urls.length) {
    return `
      <div class="deal-img image-unavailable" aria-hidden="true">
        ${fallbackIcon}
      </div>
    `;
  }

  return `
    <div class="deal-img" data-fallback-icon="${escapeHtml(fallbackIcon)}">
      <span class="image-placeholder" aria-hidden="true">
        ${fallbackIcon}
      </span>

      <img
        src="${escapeHtml(urls[0])}"
        alt="${escapeHtml(deal.title || "Deal image")}"
        data-fallbacks="${escapeHtml(JSON.stringify(urls.slice(1)))}"
      >
    </div>
  `;
}


/* =========================================================
   IMAGE FALLBACK SYSTEM
   ========================================================= */

function clearImageTimer(image) {
  const timerId = Number(image.dataset.fallbackTimer);

  if (timerId) {
    window.clearTimeout(timerId);
  }

  delete image.dataset.fallbackTimer;
}


function watchImage(image) {
  clearImageTimer(image);

  image.dataset.fallbackTimer = String(
    window.setTimeout(
      () => tryNextImage(image),
      IMAGE_LOAD_TIMEOUT_MS
    )
  );
}


function showImagePlaceholder(image) {
  clearImageTimer(image);

  const container = image.closest(".deal-img");

  if (container) {
    container.classList.add("image-unavailable");
    image.remove();
  }
}


function tryNextImage(image) {
  clearImageTimer(image);

  let fallbacks = [];

  try {
    fallbacks = JSON.parse(
      image.dataset.fallbacks || "[]"
    );
  } catch (error) {
    console.warn("Invalid image fallback list", error);
  }

  const nextUrl = fallbacks.shift();

  if (nextUrl) {
    image.dataset.fallbacks = JSON.stringify(fallbacks);

    image.src = nextUrl;

    watchImage(image);

    return;
  }

  // No more images available.
  showImagePlaceholder(image);
}


function handleImageLoad(image) {
  const isUsable =
    image.naturalWidth >= MIN_USABLE_IMAGE_DIMENSION &&
    image.naturalHeight >= MIN_USABLE_IMAGE_DIMENSION;

  if (isUsable) {
    clearImageTimer(image);
    return;
  }

  tryNextImage(image);
}


/* =========================================================
   RENDER DEALS
   ========================================================= */

function priceFromTitle(title) {
  const text = String(title || '');
  const explicit = text.match(/(?:₹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i);
  if (explicit) return Number(explicit[1].replace(/,/g,""));
  const at = text.match(/@\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?!\s*(?:l|kg|g|w|ml|cm|mm)\b)/i);
  if (at) return Number(at[1].replace(/,/g,""));
  const contextual = text.match(/(?:\bat|\bfor)\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?!\s*(?:l|kg|g|w|ml|cm|mm)\b)/i);
  return contextual ? Number(contextual[1].replace(/,/g,"")) : null;
}

function normalizedDeal(deal) {
  const out = {...deal};
  const titlePrice = priceFromTitle(out.title);
  const existing = (out.price === null || out.price === undefined || out.price === "") ? NaN : Number(out.price);
  if (titlePrice !== null && (!Number.isFinite(existing) || existing <= 10 || Math.abs(existing-titlePrice) > Math.max(50,titlePrice*0.85))) out.price = titlePrice;
  const text = String(out.title || "") + " " + String(out.badge || "");
  const dm = text.match(/(\d{1,3})\s*%\s*(?:off|discount)/i) || text.match(/upto\s*(\d{1,3})\s*%/i) || text.match(/(?:^|\s)(\d{1,3})\s*%\s*:/i);
  if (dm && !Number.isFinite(Number(out.discount))) out.discount = Number(dm[1]);
  return out;
}
function discountPct(deal) {
  if (deal.discount !== null && deal.discount !== undefined && deal.discount !== "") {
    const n = Number(deal.discount);
    if (Number.isFinite(n)) return Math.round(n);
  }
  const badgeMatch = String(deal.badge || "").match(/(\d{1,3})\s*%/);
  if (badgeMatch) return Number(badgeMatch[1]);
  const titleMatch = String(deal.title || "").match(/(\d{1,3})\s*%\s*(?:off|discount)/i);
  if (titleMatch) return Number(titleMatch[1]);
  const price = Number(deal.price);
  const original = Number(deal.original_price);
  if (Number.isFinite(price) && Number.isFinite(original) && original > price && original > 0) {
    return Math.round(((original - price) / original) * 100);
  }
  return null;
}

function retailerLabel(deal) {
  const url = String(deal.url || "").toLowerCase();
  if (url.includes("amazon.")) return "amazon.in";
  if (url.includes("flipkart.")) return "Flipkart";
  return "Online store";
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;

  const filtered = deals.map(normalizedDeal).filter(d => {
    const hay = `${d.title} ${d.category} ${d.note}`.toLowerCase();
    return (!q || hay.includes(q)) && (cat === "all" || d.category === cat);
  });

  empty.hidden = filtered.length !== 0;

  grid.innerHTML = filtered.map(d => {
    const discount = discountPct(d);
    const discountText = discount !== null ? `${discount}% OFF` : "DEAL";
    const posted = postedLabel(d);
    const price = money(d.price);
    const oldPrice = d.original_price ? money(d.original_price) : "";
    const displayPrice = price || "Check price";

    return `
      <article class="deal-card">
        ${dealImage(d)}

        <div class="deal-body">
          <div class="deal-content">
            <div class="deal-tags">
              <span class="tag retailer-tag">${escapeHtml(retailerLabel(d))}</span>
              <span class="category">${escapeHtml(d.category || "Shopping")}</span>
            </div>

            <h3>${escapeHtml(d.title)}</h3>

            <div class="price mobile-price">
              <strong>${escapeHtml(displayPrice)}</strong>
              ${oldPrice ? `<span class="old">${oldPrice}</span>` : ""}
            </div>

            <p class="deal-note">${escapeHtml(
              d.note || "Limited-time offer. Check the retailer for the final price."
            )}</p>

            <div class="deal-actions">
              <a class="view" href="${escapeHtml(d.url)}" target="_blank" rel="sponsored noopener">View deal ↗</a>
              <a class="telegram-mini" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegram</a>
            </div>
          </div>

          <div class="deal-desktop-side">
            <span class="desktop-discount">${escapeHtml(discountText)}</span>
            <span class="desktop-posted"><span aria-hidden="true">📣</span> ${escapeHtml(posted.replace(/^Posted\s*/i, ""))}</span>
            <div class="desktop-price">
              <strong>${escapeHtml(displayPrice)}</strong>
              ${oldPrice ? `<span class="old">${oldPrice}</span>` : ""}
            </div>
            <a class="desktop-buy" href="${escapeHtml(d.url)}" target="_blank" rel="sponsored noopener">🛒 Buy</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".deal-img img").forEach(watchImage);
}/* =========================================================
   CATEGORIES
   ========================================================= */

function populateCategories() {
  const cats = [
    ...new Set(
      deals
        .map(d => d.category)
        .filter(Boolean)
    )
  ].sort();

  categorySelect.innerHTML =
    `<option value="all">All categories</option>` +
    cats
      .map(
        c =>
          `<option value="${escapeHtml(c)}">
            ${escapeHtml(c)}
          </option>`
      )
      .join("");
}


/* =========================================================
   LOAD DEALS
   ========================================================= */

async function loadDeals() {
  try {
    const res = await fetch(
      `deals.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!res.ok) {
      throw new Error("deals.json unavailable");
    }

    const data = await res.json();

    feedUpdatedAt = data.updated_at || null;
    deals = Array.isArray(data.deals)
      ? data.deals.slice(0, MAX_DEALS)
      : [];

    populateCategories();
    render();

    const updated = data.updated_at ? new Date(data.updated_at) : new Date();

    if (lastUpdated) lastUpdated.textContent = "Updated " + updated.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    if (heroDealTitle) heroDealTitle.textContent = deals[0]?.title || "Waiting for the next deal…";
    if (heroProductImage && deals[0]?.image) heroProductImage.src = deals[0].image;
    if (heroProductPrice) heroProductPrice.textContent = money(normalizedDeal(deals[0] || {}).price) || "₹—";
  } catch (e) {
    console.error(e);

    if (lastUpdated) lastUpdated.textContent = "Feed unavailable";
    if (heroDealTitle) heroDealTitle.textContent = "Check Telegram for the latest deals";
  }
}


