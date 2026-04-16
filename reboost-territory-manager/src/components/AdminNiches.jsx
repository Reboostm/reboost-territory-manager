import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import './AdminNiches.css';

export default function AdminNiches() {
  const [niches, setNiches] = useState([]);
  const [zones, setZones] = useState([]);
  const [newNiche, setNewNiche] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const nicheSnap = await getDocs(collection(db, 'niches'));
      const zonesSnap = await getDocs(collection(db, 'zones'));

      setNiches(nicheSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setZones(zonesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAddNiche = async (e) => {
    e.preventDefault();
    if (!newNiche.trim()) return;

    try {
      const slug = generateSlug(newNiche);

      await addDoc(collection(db, 'niches'), {
        id: slug,
        name: newNiche,
        slug,
      });

      // Add to all existing zones
      for (const zone of zones) {
        const updatedSlots = { ...zone.nicheSlots };
        updatedSlots[slug] = { status: 'available', clientName: '' };

        await updateDoc(doc(db, 'zones', zone.id), {
          nicheSlots: updatedSlots,
        });
      }

      setNewNiche('');
      await fetchData();
    } catch (err) {
      console.error('Error adding niche:', err);
    }
  };

  const handleDeleteNiche = async (nicheId) => {
    if (!window.confirm('Delete this niche? It will be removed from all zones.')) return;

    try {
      // Delete from niches collection
      await deleteDoc(doc(db, 'niches', nicheId));

      // Remove from all zones
      for (const zone of zones) {
        const updatedSlots = { ...zone.nicheSlots };
        delete updatedSlots[nicheId];

        await updateDoc(doc(db, 'zones', zone.id), {
          nicheSlots: updatedSlots,
        });
      }

      await fetchData();
    } catch (err) {
      console.error('Error deleting niche:', err);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-niches">
      <div className="section-header">
        <h2>Service Niches</h2>
      </div>

      <form onSubmit={handleAddNiche} className="form-card">
        <h3>Add New Niche</h3>
        <div className="form-group">
          <label>Service Name</label>
          <input
            value={newNiche}
            onChange={(e) => setNewNiche(e.target.value)}
            placeholder="e.g., House Cleaner, Electrician"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Niche</button>
      </form>

      <div className="niches-list">
        <h3>Existing Niches</h3>
        {niches.length === 0 ? (
          <p style={{ color: '#999' }}>No niches added yet.</p>
        ) : (
          <ul>
            {niches.map(niche => (
              <li key={niche.id}>
                <div>
                  <strong>{niche.name}</strong>
                  <span className="niche-slug">{niche.slug}</span>
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeleteNiche(niche.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
