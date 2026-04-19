import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { businessName, category, city, state, website, firstName, lastName, email, phone, source } = req.body;

  if (!businessName || !email || !city || !state || !firstName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const docRef = await addDoc(collection(db, 'seo_audits'), {
      lead: { businessName, category, city, state, website: website || null, firstName, lastName, email, phone: phone || null, source: source || null },
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({ id: docRef.id });
  } catch (e) {
    console.error('[submit]', e);
    return res.status(500).json({ error: 'Failed to create audit record' });
  }
}
