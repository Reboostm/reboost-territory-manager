import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import './LandingPage.css';

export default function LandingPage() {
  const { state, niche, zone } = useParams();
  const [zoneData, setZoneData] = useState(null);
  const [nicheData, setNicheData] = useState(null);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ name: '', email: '' });
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Find zone by slug
        const zoneSlug = zone.toLowerCase().replace(/-/g, ' ');
        const zonesSnap = await getDocs(
          query(collection(db, 'zones'), where('state', '==', state.toUpperCase()))
        );
        const matchedZone = zonesSnap.docs.find(doc =>
          doc.data().name.toLowerCase() === zoneSlug
        );

        if (!matchedZone) {
          setLoading(false);
          return;
        }

        setZoneData({ id: matchedZone.id, ...matchedZone.data() });

        // Find niche
        const nichesSnap = await getDocs(collection(db, 'niches'));
        const matched = nichesSnap.docs.find(doc => doc.id === niche);
        if (matched) {
          setNicheData({ id: matched.id, ...matched.data() });
        }

        // Get calendar URL
        const settingsSnap = await getDocs(collection(db, 'settings'));
        const bookingDoc = settingsSnap.docs.find(d => d.id === 'booking');
        if (bookingDoc) {
          setCalendarUrl(bookingDoc.data().calendarUrl);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state, niche, zone]);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'waitlist'), {
        zoneId: zoneData.id,
        niche: niche,
        name: waitlistForm.name,
        email: waitlistForm.email,
        createdAt: new Date(),
      });
      setWaitlistSubmitted(true);
      setWaitlistForm({ name: '', email: '' });
      setTimeout(() => setWaitlistSubmitted(false), 3000);
    } catch (err) {
      console.error('Error adding to waitlist:', err);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  if (!zoneData || !nicheData) {
    return <Navigate to="/check" />;
  }

  const slot = zoneData.nicheSlots?.[niche];
  const status = slot?.status || 'available';

  if (status === 'hidden') {
    return <Navigate to="/check" />;
  }

  const isAvailable = status === 'available';
  const title = `${nicheData.name} Marketing — ${zoneData.name}, ${zoneData.state}`;

  return (
    <>
      <head>
        <title>{title} | ReBoost Territory Manager</title>
        <meta name="description" content={`${nicheData.name} services available in ${zoneData.name}, ${zoneData.state}. Book a free strategy call with ReBoost.`} />
      </head>

      <div className="landing-page">
        <header className="landing-header">
          <h1>{title}</h1>
          <p>{zoneData.cities?.slice(0, 3).join(', ')}...</p>
        </header>

        <main className="landing-main">
          <div className="landing-content">
            {isAvailable ? (
              <div className="availability-available">
                <div className="badge badge-green" style={{ marginBottom: 16 }}>✓ Available</div>
                <h2>Only 1 Spot Available</h2>
                <p>We only work with one {nicheData.name.toLowerCase()} per area. This exclusive spot in {zoneData.name} is still available.</p>
                <p style={{ marginTop: 20 }}>Lock in your exclusive territory now with a free strategy call.</p>

                <button className="btn btn-primary" style={{ marginTop: 24, fontSize: 16, padding: '14px 32px' }} onClick={() => window.open(calendarUrl, '_blank')}>
                  Book Your Free Strategy Call
                </button>
              </div>
            ) : (
              <div className="availability-taken">
                <div className="badge badge-red" style={{ marginBottom: 16 }}>✗ Taken</div>
                <h2>Area Claimed</h2>
                <p>This {nicheData.name.toLowerCase()} territory in {zoneData.name} is currently claimed by another business.</p>
                <p style={{ marginTop: 20 }}>Join our waitlist to be notified if the territory becomes available.</p>

                <form onSubmit={handleWaitlistSubmit} className="waitlist-form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={waitlistForm.name}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={waitlistForm.email}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Join Waitlist</button>
                  {waitlistSubmitted && <p style={{ color: '#10b981', marginTop: 12 }}>✓ Added to waitlist!</p>}
                </form>
              </div>
            )}
          </div>
        </main>

        <footer className="landing-footer">
          <p>&copy; 2024 ReBoost Marketing Agency. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
