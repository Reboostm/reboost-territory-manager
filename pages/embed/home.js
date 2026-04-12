/**
 * Embeddable Home Page Widget — renders inside an iframe on GHL sites.
 * URL: /embed/home
 */
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function getServerSideProps() {
  try {
    const q = query(collection(db, 'obituaries'), where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    const obituaries = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.createdAt)
      .sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
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
    return { props: { obituaries } };
  } catch (error) {
    console.error('Embed home error:', error);
    return { props: { obituaries: [], error: error.message } };
  }
}

export default function EmbedHome({ obituaries, error }) {
  if (error) {
    return (
      <html>
        <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: 'transparent' }}>
          <p style={{ color: '#6b7280', fontSize: '.9rem' }}>Unable to load obituaries.</p>
        </body>
      </html>
    );
  }

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, serif; background: transparent; }
          .rb-hw { padding: 24px 0; }
          .rb-hw-title { color: #f59e0b; font-size: 1.1rem; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 16px; }
          .rb-hw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
          .rb-hw-card { background: #1e1e2e; border: 1px solid #374151; border-radius: 12px; overflow: hidden; text-align: center; padding: 16px; transition: border-color .2s; }
          .rb-hw-card:hover { border-color: #d97706; }
          .rb-hw-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #d97706; margin: 0 auto 10px; display: block; }
          .rb-hw-placeholder { width: 80px; height: 80px; border-radius: 50%; background: #374151; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #6b7280; }
          .rb-hw-name { color: #fff; font-size: .95rem; margin-bottom: 4px; }
          .rb-hw-dates { color: #9ca3af; font-size: .78rem; }
          .rb-hw-empty { color: #6b7280; font-size: .9rem; }
        `}} />
      </head>
      <body>
        <div className="rb-hw">
          <div className="rb-hw-title">In Memoriam</div>
          <div className="rb-hw-grid">
            {obituaries.length === 0 ? (
              <div className="rb-hw-empty">No recent obituaries.</div>
            ) : (
              obituaries.map((o) => (
                <div key={o.id} className="rb-hw-card">
                  {o.images && o.images[0] ? (
                    <img className="rb-hw-img" src={o.images[0]} alt={o.fullName} />
                  ) : (
                    <div className="rb-hw-placeholder">✝</div>
                  )}
                  <div className="rb-hw-name">{o.fullName}</div>
                  <div className="rb-hw-dates">
                    {[o.birthDate, o.deathDate].filter(Boolean).join(' – ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
