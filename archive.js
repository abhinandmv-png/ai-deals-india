(() => {
  const PER_PAGE = 50;
  const grid = document.getElementById('archiveGrid');
  const pager = document.getElementById('pagination');
  const count = document.getElementById('archiveCount');
  const money = v => v === null || v === undefined || v === '' ? '' : new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(v));
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const imageFor = d => d.image || (String(d.url||'').match(/(?:dp|gp\/product\/)([A-Z0-9]{10})/i) ? `https://m.media-amazon.com/images/P/${String(d.url).match(/(?:dp|gp\/product\/)([A-Z0-9]{10})/i)[1].toUpperCase()}.01._SL500_.jpg` : '');
  async function start(){
    const res=await fetch(`deals.json?v=${Date.now()}`,{cache:'no-store'}); if(!res.ok) throw new Error('Feed unavailable');
    const data=await res.json(); const deals=Array.isArray(data.deals)?data.deals:[];
    const page=Math.max(1,parseInt(new URLSearchParams(location.search).get('page')||'1',10)||1); const pages=Math.max(1,Math.ceil(deals.length/PER_PAGE)); const p=Math.min(page,pages); const slice=deals.slice((p-1)*PER_PAGE,p*PER_PAGE);
    if(count) count.textContent=`Showing ${slice.length ? (p-1)*PER_PAGE+1 : 0}–${Math.min(p*PER_PAGE,deals.length)} of ${deals.length} deals`;
    grid.innerHTML=slice.map((d,i)=>{const img=imageFor(d);return `<article class="archive-card" id="deal-${(p-1)*PER_PAGE+i+1}">${img?`<img src="${esc(img)}" alt="${esc(d.title||'Deal image')}" loading="lazy" decoding="async">`:'<div></div>'}<div><div class="archive-meta">${esc(d.category||'Shopping')} · ${esc(d.badge||'DEAL')}</div><h2>${esc(d.title||'Amazon Deal')}</h2><div class="archive-price">${esc(money(d.price)||'Check price')}${d.original_price?` <del>${esc(money(d.original_price))}</del>`:''}</div><a class="archive-buy" href="${esc(d.url||'#')}" target="_blank" rel="sponsored noopener noreferrer"><img src="https://www.amazon.in/favicon.ico" alt="Amazon">Buy at Amazon →</a></div></article>`}).join('');
    pager.innerHTML=''; if(p>1)pager.insertAdjacentHTML('beforeend',`<a href="?page=${p-1}">← Newer</a>`); for(let n=Math.max(1,p-2);n<=Math.min(pages,p+2);n++)pager.insertAdjacentHTML('beforeend',n===p?`<span class="current">${n}</span>`:`<a href="?page=${n}">${n}</a>`); if(p<pages)pager.insertAdjacentHTML('beforeend',`<a href="?page=${p+1}">Older →</a>`);
  }
  start().catch(e=>{grid.innerHTML='<p>Deals are temporarily unavailable. Please try again.</p>';console.error(e)});
})();
