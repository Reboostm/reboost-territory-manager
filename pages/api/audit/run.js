import { db } from '../../../lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { runAudit } from '../../../lib/auditEngine';
import { pushLeadToGHL } from '../../../lib/ghl';
import { sendAuditReport } from '../../../lib/email';

export const config = { api: { bodyParser: true, responseLimit: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing audit id' });

  const docRef = doc(db, 'seo_audits', id);

  const snap = await getDoc(docRef);
  if (!snap.exists()) return res.status(404).json({ error: 'Audit not found' });

  const { lead, status } = snap.data();

  // Don't re-run if already complete or running
  if (status === 'complete') return res.status(200).json({ success: true, alreadyComplete: true });
  if (status === 'running') return res.status(200).json({ success: true, inProgress: true });

  await updateDoc(docRef, { status: 'running' });

  try {
    const audit = await runAudit(lead);

    await updateDoc(docRef, {
      audit,
      status: 'complete',
      completedAt: serverTimestamp(),
    });

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const reportUrl = `${base}/audit/report/${id}`;

    // Fire-and-forget integrations
    pushLeadToGHL({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      businessName: lead.businessName,
      score: audit.overallScore,
      grade: audit.grade,
      reportUrl,
      city: lead.city,
      state: lead.state,
    }).catch(console.error);

    sendAuditReport({
      to: lead.email,
      businessName: lead.businessName,
      contactName: lead.firstName,
      score: audit.overallScore,
      grade: audit.grade,
      reportUrl,
    }).catch(console.error);

    return res.status(200).json({ success: true, audit });
  } catch (e) {
    console.error('[run]', e);
    await updateDoc(docRef, { status: 'failed', error: e.message }).catch(() => {});
    return res.status(500).json({ error: 'Audit execution failed' });
  }
}
