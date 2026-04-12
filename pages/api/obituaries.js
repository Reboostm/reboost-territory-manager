import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  // Enable CORS for cross-origin requests from GHL and other websites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { limit = 6, published = 'true' } = req.query;
  const limitNum = Math.min(parseInt(limit) || 6, 100);

  try {
    const q = query(
      collection(db, 'obituaries'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);

    const obituaries = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((o) => o.createdAt)
      .sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return tb - ta;
      })
      .slice(0, limitNum);

    return res.status(200).json(obituaries);
  } catch (error) {
    console.error('Error fetching obituaries:', error);
    return res.status(500).json({ error: error.message });
  }
}
