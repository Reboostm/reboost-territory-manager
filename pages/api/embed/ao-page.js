/**
 * All Obituaries Page — server-rendered HTML for iframe embedding.
 * URL: /api/embed/ao-page
 * GHL embed: <iframe src="https://obituary-management-system.vercel.app/api/embed/ao-page" ...>
 */
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.removeHeader('X-Frame-Options');

  try {
    const q = query(collection(db, 'obituaries'), where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    const obituaries = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.createdAt)
      .sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds || 0) * 1000;
        const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds || 0) * 1000;
        return tb - ta;
      });

    const cards = obituaries.length === 0
      ? '<div class="empty">No obituaries found.</div>'
      : obituaries.map((o, i) => {
          const dates = [o.birthDate, o.deathDate].filter(Boolean).join(' \u2013 ');
          const excerpt = o.bio ? esc(o.bio.slice(0, 250)) + (o.bio.length > 250 ? '...' : '') : '';
          const href = esc(o.url || '#');
          const img = o.images && o.images[0]
            ? `<img class="card-img" src="${esc(o.images[0])}" alt="${esc(o.fullName)}">`
            : '<div class="card-placeholder">&#10013;</div>';
          const even = i % 2 === 1;
          return `
<a href="${href}" target="_top" class="card${even ? ' card-even' : ''}">
  <div class="card-content">
    <div class="card-name">${esc(o.fullName)}</div>
    <div class="card-dates">${esc(dates)}</div>
    ${o.location ? `<div class="card-location">${esc(o.location)}</div>` : ''}
    <div class="card-bio">${excerpt}</div>
    <span class="card-btn">Visit Obituary</span>
  </div>
  <div class="img-wrap">${img}</div>
</a>`;
        }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;background:transparent;padding:0}
.container{padding:0}
.title{color:#d4af7f;font-size:1.5rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;font-weight:600;text-align:center}
.subtitle{color:#d1d5db;font-size:1rem;text-align:center;margin-bottom:28px;line-height:1.6}
.search-wrap{display:flex;justify-content:center;margin-bottom:32px}
.search{width:100%;max-width:500px;padding:12px 18px;background:#fff;border:1px solid #d4af7f;color:#000;border-radius:8px;font-size:1rem;font-family:Georgia,serif}
.search::placeholder{color:#999}
.grid{display:grid;grid-template-columns:1fr;gap:24px;max-width:900px;margin:0 auto}
.card{background:#0a0a0a;border:1px solid #d4af7f;border-radius:12px;overflow:hidden;transition:all .3s ease;display:grid;grid-template-columns:240px 1fr;gap:20px;padding:20px;text-decoration:none;color:inherit;align-items:center}
.card-even{grid-template-columns:1fr 240px}
.card-even .img-wrap{order:2}
.card:hover{border-color:#e8c99a;box-shadow:0 4px 20px rgba(212,175,127,.35);transform:translateY(-2px)}
.card-content{display:flex;flex-direction:column;justify-content:flex-start;gap:0}
.card-name{color:#d4af7f;font-size:1.4rem;font-weight:600;margin-bottom:6px}
.card-dates{color:#d1d5db;font-size:.95rem;margin-bottom:6px}
.card-location{color:#9ca3af;font-size:.9rem;margin-bottom:10px}
.card-bio{color:#d1d5db;font-size:.95rem;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:14px}
.img-wrap{width:240px;height:240px;flex-shrink:0}
.card-img{width:240px;height:240px;border-radius:8px;object-fit:cover;border:2px solid #d4af7f;display:block}
.card-placeholder{width:240px;height:240px;border-radius:8px;border:2px solid #d4af7f;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#d4af7f;font-size:3rem}
.card-btn{display:inline-block;padding:9px 22px;background:transparent;color:#d4af7f;border:1px solid #d4af7f;border-radius:6px;font-size:.95rem;font-weight:600;text-decoration:none;transition:all .2s;width:fit-content}
.card-btn:hover{background:#d4af7f;color:#000}
.empty{text-align:center;padding:40px;color:#6b7280;font-size:1.1rem}
</style>
</head>
<body>
<div class="container">
  <div class="title">Obituaries</div>
  <div class="subtitle">Honoring Lives. Sharing Memories. Keeping Loved Ones Close<br>View recent obituaries, share condolences, and celebrate the lives of those who will always be remembered.</div>
  <div class="search-wrap">
    <input type="text" id="search" class="search" placeholder="Search obituaries by name..." oninput="doSearch(this.value)" />
  </div>
  <div id="grid" class="grid">${cards}</div>
</div>
<script>
var all = document.getElementById('grid').innerHTML;
var items = Array.from(document.querySelectorAll('.card'));
function doSearch(q) {
  q = q.toLowerCase();
  items.forEach(function(c) {
    var name = c.querySelector('.card-name');
    c.style.display = (!q || (name && name.textContent.toLowerCase().indexOf(q) > -1)) ? '' : 'none';
  });
}
// Tell parent iframe to resize
function notifyHeight() {
  try { parent.postMessage({ rbHeight: document.body.scrollHeight }, '*'); } catch(e) {}
}
window.addEventListener('load', notifyHeight);
window.addEventListener('resize', notifyHeight);
setTimeout(notifyHeight, 300);
</script>
</body>
</html>`;

    return res.status(200).send(html);
  } catch (error) {
    console.error('Embed ao-page error:', error);
    return res.status(500).send(`<!DOCTYPE html><html><body style="font-family:Georgia,serif;color:#6b7280;padding:20px">Unable to load obituaries. Please refresh.</body></html>`);
  }
}
