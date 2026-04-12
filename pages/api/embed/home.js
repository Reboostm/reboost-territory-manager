/**
 * Embeddable Home Page — returns a complete HTML page for iframe embedding.
 * URL: /api/embed/home
 * Usage: <iframe src="https://obituary-management-system.vercel.app/api/embed/home" ...>
 */
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  // Allow iframe embedding from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Remove X-Frame-Options to allow iframe embedding
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
      })
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        fullName: o.fullName || '',
        birthDate: o.birthDate || '',
        deathDate: o.deathDate || '',
        images: o.images || [],
      }));

    const cards = obituaries.length === 0
      ? '<div class="rb-hw-empty">No recent obituaries.</div>'
      : obituaries.map((o) => {
          const img = o.images && o.images[0]
            ? `<img class="rb-hw-img" src="${esc(o.images[0])}" alt="${esc(o.fullName)}">`
            : '<div class="rb-hw-placeholder">&#10013;</div>';
          const dates = [o.birthDate, o.deathDate].filter(Boolean).join(' – ');
          return `<div class="rb-hw-card">${img}<div class="rb-hw-name">${esc(o.fullName)}</div><div class="rb-hw-dates">${esc(dates)}</div></div>`;
        }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,serif;background:transparent}
.rb-hw{padding:24px 0}
.rb-hw-title{color:#f59e0b;font-size:1.1rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
.rb-hw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
.rb-hw-card{background:#1e1e2e;border:1px solid #374151;border-radius:12px;overflow:hidden;text-align:center;padding:16px;transition:border-color .2s}
.rb-hw-card:hover{border-color:#d97706}
.rb-hw-img{width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #d97706;margin:0 auto 10px;display:block}
.rb-hw-placeholder{width:80px;height:80px;border-radius:50%;background:#374151;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#6b7280}
.rb-hw-name{color:#fff;font-size:.95rem;margin-bottom:4px}
.rb-hw-dates{color:#9ca3af;font-size:.78rem}
.rb-hw-empty{color:#6b7280;font-size:.9rem}
</style>
</head>
<body>
<div class="rb-hw">
  <div class="rb-hw-title">In Memoriam</div>
  <div class="rb-hw-grid">${cards}</div>
</div>
</body>
</html>`;

    return res.status(200).send(html);
  } catch (error) {
    console.error('Embed home error:', error);
    const html = `<!DOCTYPE html>
<html><body style="margin:0;font-family:Georgia,serif;background:transparent">
<p style="color:#6b7280;font-size:.9rem">Unable to load obituaries.</p>
</body></html>`;
    return res.status(200).send(html);
  }
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
