import { db } from '../../../lib/firebase';
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing obituary ID' });
  }

  try {
    const q = query(
      collection(db, 'memories'),
      where('obituaryId', '==', id)
    );
    const snapshot = await getDocs(q);

    const memories = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) => m.published !== false)
      .sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return tb - ta;
      });

    return res.status(200).json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    return res.status(500).json({ error: error.message });
  }
}
