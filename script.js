const TELEGRAM_URL = "https://t.me/onlineshopingdeals_india";
const REFRESH_MS = 60000;

const grid = document.getElementById("dealGrid");
const empty = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const lastUpdated = document.getElementById("lastUpdated");
const heroDealTitle = document.getElementById("heroDealTitle");

let deals = [];

function money(v) {
  if (v === null || v === undefined || v === "") return "";
  return new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(Number(v));
}

function escapeHtml(s="") {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function iconFor(category="") {
  const c = category.toLowerCase();
  if (c.includes("fashion") || c.includes("cloth")) return "👕";
  if (c.includes("beauty") || c.includes("personal")) return "✨";
  if (c.includes("elect")) return "🎧";
  if (c.includes("home")) return "🏠";
  if (c.includes("travel") || c.includes("luggage")) return "🧳";
  return "🛒";
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;
  const filtered = deals.filter(d => {
    const hay = `${d.title} ${d.category} ${d.note}`.toLowerCase();
    return (!q || hay.includes(q)) && (cat === "all" || d.category === cat);
  });

  empty.hidden = filtered.length !== 0;
  grid.innerHTML = filtered.map(d => `
    <article class="deal-card">
      <div class="deal-img">${d.image ? `<img src="${escapeHtml(d.image)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.onerror=null;this.src='${escapeHtml((d.image_fallbacks && d.image_fallbacks[0]) || "")}'">` : iconFor(d.category)}</div>
      <div class="deal-body">
        <div class="deal-tags">
          <span class="tag">${escapeHtml(d.badge || "DEAL")}</span>
          <span class="category">${escapeHtml(d.category || "Shopping")}</span>
        </div>
        <h3>${escapeHtml(d.title)}</h3>
        <div class="price">
          <strong>${money(d.price)}</strong>
          ${d.original_price ? `<span class="old">${money(d.original_price)}</span>` : ""}
        </div>
        <p class="deal-note">${escapeHtml(d.note || "Limited-time offer. Check the retailer for the final price.")}</p>
        <div class="deal-actions">
          <a class="view" href="${escapeHtml(d.url)}" target="_blank" rel="sponsored noopener">View deal ↗</a>
          <a class="telegram-mini" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegram</a>
        </div>
      </div>
    </article>
  `).join("");
}

function populateCategories() {
  const cats = [...new Set(deals.map(d => d.category).filter(Boolean))].sort();
  categorySelect.innerHTML = `<option value="all">All categories</option>` +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

async function loadDeals() {
  try {
    const res = await fetch(`deals.json?v=${Date.now()}`, {cache:"no-store"});
    if (!res.ok) throw new Error("deals.json unavailable");
    const data = await res.json();
    deals = Array.isArray(data.deals) ? data.deals : [];
    populateCategories();
    render();
    const updated = data.updated_at ? new Date(data.updated_at) : new Date();
    lastUpdated.textContent = "Updated " + updated.toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"});
    heroDealTitle.textContent = deals[0]?.title || "Waiting for the next deal…";
  } catch (e) {
    console.error(e);
    lastUpdated.textContent = "Feed unavailable";
    heroDealTitle.textContent = "Check Telegram for the latest deals";
  }
}

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
document.getElementById("year").textContent = new Date().getFullYear();

loadDeals();
setInterval(loadDeals, REFRESH_MS);
