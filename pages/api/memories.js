import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default async function handler(req, res) {
  // Enable CORS for GHL and other cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { obituaryId, name, relationship, memoryText, photos } = req.body;

  // Validate required fields
  if (!obituaryId || !name || !memoryText) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const docRef = await addDoc(collection(db, 'memories'), {
      obituaryId,
      name,
      relationship,
      memoryText,
      photos: photos || [],
      published: true,
      createdAt: serverTimestamp(),
    });

    return res.status(201).json({ id: docRef.id, success: true });
  } catch (error) {
    console.error('Error submitting memory:', error);
    return res.status(500).json({ error: error.message });
  }
}
