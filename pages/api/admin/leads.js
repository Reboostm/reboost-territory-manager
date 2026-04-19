import { db } from '../../../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'reboost2024';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { password } = req.query;
  if (!password || password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const q = query(collection(db, 'seo_audits'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    const leads = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        lead: data.lead,
        status: data.status,
        audit: data.audit
          ? {
              overallScore: data.audit.overallScore,
              grade: data.audit.grade,
              gradeLabel: data.audit.gradeLabel,
              gmb: data.audit.gmb,
              ranking: data.audit.ranking,
              website: data.audit.website,
              actionItems: data.audit.actionItems,
            }
          : null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return res.status(200).json({ leads, total: leads.length });
  } catch (e) {
    console.error('[admin/leads]', e);
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
}
