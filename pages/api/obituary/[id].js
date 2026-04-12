import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
    const docRef = doc(db, 'obituaries', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Obituary not found' });
    }

    const data = docSnap.data();

    // Only return published obituaries (unless explicitly requested)
    if (data.status !== 'published') {
      return res.status(403).json({ error: 'Obituary is not published' });
    }

    return res.status(200).json({ id, ...data });
  } catch (error) {
    console.error('Error fetching obituary:', error);
    return res.status(500).json({ error: error.message });
  }
}
