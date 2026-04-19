import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;

  try {
    const snap = await getDoc(doc(db, 'seo_audits', id));
    if (!snap.exists()) return res.status(404).json({ error: 'Not found' });

    const data = snap.data();
    return res.status(200).json({
      status: data.status,
      audit: data.status === 'complete' ? data.audit : null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}
