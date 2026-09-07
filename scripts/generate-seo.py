import json, re
from html import escape

DOMAIN = "https://onlineshoppingindia.shop"
MAX_DEALS = 500

def price_from_title(title):
    text = str(title or "")
    patterns = [
        r"(?:₹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.[0-9]+)?)",
        r"@\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?!\s*(?:l|kg|g|w|ml|cm|mm)\b)",
        r"(?:\bat|\bfor)\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)(?!\s*(?:l|kg|g|w|ml|cm|mm)\b)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return float(match.group(1).replace(",", ""))
    return None

def normalize(deal):
    item = dict(deal)
    parsed = price_from_title(item.get("title"))
    current = item.get("price")
    try:
        current_num = float(current)
    except (TypeError, ValueError):
        current_num = None
    if parsed is not None and (current_num is None or current_num <= 10 or abs(current_num - parsed) > max(50, parsed * 0.85)):
        item["price"] = parsed
    text = f'{item.get("title", "")} {item.get("badge", "")}'
    match = re.search(r"(\d{1,3})\s*%\s*(?:off|discount)", text, re.I) or re.search(r"upto\s*(\d{1,3})\s*%", text, re.I) or re.search(r"(?:^|\s)(\d{1,3})\s*%\s*:", text)
    if match and not str(item.get("discount", "")).strip():
        item["discount"] = int(match.group(1))
    return item

def money(value):
    if value in (None, ""):
        return ""
    try:
        n = float(value)
    except (TypeError, ValueError):
        return ""
    return "₹{:,.0f}".format(n)

with open("deals.json", encoding="utf-8") as f:
    data = json.load(f)

deals = [normalize(d) for d in data.get("deals", [])[:MAX_DEALS]]
cards = []
items = []

for i, deal in enumerate(deals, 1):
    title = escape(str(deal.get("title") or "Online shopping deal"))
    category = escape(str(deal.get("category") or "Shopping"))
    url = escape(str(deal.get("url") or ""), quote=True)
    image = escape(str(deal.get("image") or ""), quote=True)
    price = money(deal.get("price"))
    old = money(deal.get("original_price"))
    discount = deal.get("discount")
    badge = f"{int(float(discount))}% OFF" if str(discount).strip() else str(deal.get("badge") or "DEAL")
    image_html = f'<img src="{image}" alt="{title}" loading="lazy" decoding="async">' if image else ""
    old_html = f" <del>{escape(old)}</del>" if old else ""
    cards.append(
        f'<article class="deal-item" id="deal-{i}">{image_html}'
        f'<div><p class="meta">{category} · <strong>{escape(badge)}</strong></p>'
        f'<h2>{title}</h2><p class="price">{escape(price or "Check price")}{old_html}</p>'
        f'<p>Check the retailer for the latest price, availability and delivery details.</p>'
        f'<a href="{url}" target="_blank" rel="sponsored noopener noreferrer">View deal ↗</a></div></article>'
    )
    items.append({
        "@type": "ListItem",
        "position": i,
        "name": str(deal.get("title") or "Online shopping deal"),
        "url": f"{DOMAIN}/deals.html#deal-{i}",
    })

updated = escape(str(data.get("updated_at") or ""))
schema_page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Latest Online Shopping Deals in India",
    "url": f"{DOMAIN}/deals.html",
    "description": "Latest online shopping deals, Amazon offers, discounts and price drops in India.",
    "inLanguage": "en-IN",
    "isPartOf": {"@type": "WebSite", "name": "Online Shopping India", "url": f"{DOMAIN}/"},
}
schema_list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Latest online shopping deals in India",
    "numberOfItems": len(items),
    "itemListElement": items,
}

html = f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Latest Online Shopping Deals India | Amazon Deals, Offers & Price Drops</title>
<meta name="description" content="Browse the latest online shopping deals in India, including Amazon deals, offers, discounts and price drops. Compare listed prices and verify the final price before buying.">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="{DOMAIN}/deals.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Online Shopping India">
<meta property="og:title" content="Latest Online Shopping Deals India | Amazon Deals & Offers">
<meta property="og:description" content="Fresh online shopping deals, Amazon offers, discounts and price drops in India.">
<meta property="og:url" content="{DOMAIN}/deals.html">
<meta property="og:image" content="{DOMAIN}/logo.png">
<script type="application/ld+json">{json.dumps(schema_page, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(schema_list, ensure_ascii=False)}</script>
<style>
body{{margin:0;background:#070914;color:#f5f7fb;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}}
main{{max-width:1180px;margin:auto;padding:36px 20px}}a{{color:#7dd3fc}}.top{{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px}}
h1{{font-size:clamp(32px,5vw,58px);line-height:1.05}}.intro{{color:#a8b3c4;max-width:820px}}
.deal-item{{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:16px;margin:14px 0;border:1px solid #1c2939;border-radius:18px;background:#0d1420}}
.deal-item img{{width:150px;height:150px;object-fit:contain;background:#fff;border-radius:12px}}.deal-item h2{{font-size:20px;line-height:1.3;margin:5px 0}}
.meta{{font-size:13px;color:#9aa8ba}}.meta strong{{color:#ff5b57}}.price{{font-size:25px;font-weight:800;margin:8px 0}}
.price del{{font-size:14px;color:#718096;margin-left:8px}}.deal-item p{{color:#aab5c5}}.deal-item a{{font-weight:700}}
.notice{{color:#8190a5;font-size:13px}}@media(max-width:600px){{main{{padding:24px 14px}}.deal-item{{grid-template-columns:100px 1fr;gap:12px;padding:12px}}.deal-item img{{width:100px;height:120px}}.deal-item h2{{font-size:16px}}.price{{font-size:20px}}}}
</style>
</head>
<body><main>
<header class="top"><a href="/" aria-label="Online Shopping India home">Deals India</a><a href="https://t.me/onlineshopingdeals_india" target="_blank" rel="noopener noreferrer">Join Telegram ↗</a></header>
<section><p>ONLINE SHOPPING DEALS / INDIA</p><h1>Latest online shopping deals in India</h1>
<p class="intro">Browse fresh shopping deals, Amazon offers, discounts and price drops. Prices and availability can change; always verify the final price on the retailer before buying.</p></section>
<section aria-label="Latest deals">
{chr(10).join(cards)}
</section>
<p class="notice">Feed snapshot: {updated} · Some links may be affiliate links.</p>
</main></body></html>
'''

with open("deals.html", "w", encoding="utf-8") as f:
    f.write(html)

sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{DOMAIN}/</loc><lastmod>{updated}</lastmod></url>
  <url><loc>{DOMAIN}/deals.html</loc><lastmod>{updated}</lastmod></url>
</urlset>
'''
with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap)
