import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Check.css';

export default function Check() {
  const [zones, setZones] = useState([]);
  const [niches, setNiches] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const zonesSnap = await getDocs(query(collection(db, 'zones'), orderBy('name')));
        const nicheSnap = await getDocs(collection(db, 'niches'));
        const settingsSnap = await getDocs(collection(db, 'settings'));

        setZones(zonesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setNiches(nicheSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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
  }, []);

  const matchedZones = useMemo(() => {
    if (!searchInput.trim()) return [];

    const search = searchInput.toLowerCase();
    return zones.filter(zone => {
      const cityMatch = zone.cities?.some(city => city.toLowerCase().includes(search));
      const zipMatch = zone.zips?.some(zip => zip.includes(search));
      const nameMatch = zone.name.toLowerCase().includes(search);
      return cityMatch || zipMatch || nameMatch;
    });
  }, [searchInput, zones]);

  const handleBookCall = () => {
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="check-page">
      <header className="check-header">
        <div className="check-header-content">
          <h1>ReBoost Territory Availability</h1>
          <p>Find out what services are available in your area</p>
        </div>
      </header>

      <main className="check-main">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter city name or zip code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />

          {searchInput && matchedZones.length > 0 && (
            <div className="search-results">
              {matchedZones.map(zone => (
                <button
                  key={zone.id}
                  className="search-result-item"
                  onClick={() => {
                    setSelectedZone(zone);
                    setSearchInput('');
                  }}
                >
                  {zone.name}, {zone.state}
                </button>
              ))}
            </div>
          )}

          {searchInput && matchedZones.length === 0 && (
            <div className="search-no-results">No areas found</div>
          )}
        </div>

        {selectedZone ? (
          <div className="zone-results">
            <button
              className="btn-back"
              onClick={() => setSelectedZone(null)}
            >
              ← Back to Search
            </button>

            <h2>{selectedZone.name}, {selectedZone.state}</h2>
            <p className="zone-cities">
              Serving: {selectedZone.cities?.join(', ')}
            </p>

            <div className="niche-cards">
              {niches.map(niche => {
                const slot = selectedZone.nicheSlots?.[niche.id];
                const status = slot?.status || 'available';

                if (status === 'hidden') return null;

                const isAvailable = status === 'available';

                return (
                  <div key={niche.id} className="niche-card">
                    <h3>{niche.name}</h3>
                    {isAvailable ? (
                      <div>
                        <div className="badge badge-green">✓ Available</div>
                        <p style={{ marginTop: 12, marginBottom: 12 }}>
                          Only 1 spot available in {selectedZone.name}. We only work with one {niche.name.toLowerCase()} per area.
                        </p>
                        <button className="btn btn-primary" onClick={handleBookCall}>
                          Book Your Free Strategy Call
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="badge badge-red">✗ Taken</div>
                        <p style={{ marginTop: 12 }}>This area is currently claimed.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="no-service-notice">
              <p>Don't see your service? We may not have listed it yet — book a call and we'll check availability for you.</p>
              <button className="btn btn-primary" onClick={handleBookCall}>
                Book Your Free Call
              </button>
            </div>
          </div>
        ) : (
          <div className="search-prompt">
            <p>Search by city name or zip code to check availability</p>
          </div>
        )}
      </main>
    </div>
  );
}
