import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'memories';

export async function getMemoriesForObituary(obituaryId) {
  // Single where clause only — avoids composite index requirement
  // Sort by createdAt descending in JS
  const q = query(
    collection(db, COLLECTION),
    where('obituaryId', '==', obituaryId)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => {
    const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return tb - ta;
  });
}

export async function addMemory(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    published: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteMemory(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function setMemoryPublished(id, published) {
  await updateDoc(doc(db, COLLECTION, id), { published });
}
