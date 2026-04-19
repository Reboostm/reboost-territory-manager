import { db } from '../../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'reboost2024';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id, password } = req.query;
  if (!password || password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const snap = await getDoc(doc(db, 'seo_audits', id));
    if (!snap.exists()) return res.status(404).json({ error: 'Not found' });

    const data = snap.data();
    return res.status(200).json({
      id: snap.id,
      lead: data.lead,
      status: data.status,
      audit: data.audit || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch lead' });
  }
}
