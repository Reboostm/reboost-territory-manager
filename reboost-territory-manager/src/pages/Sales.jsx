import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Sales.css';

export default function Sales() {
  const [zones, setZones] = useState([]);
  const [niches, setNiches] = useState([]);
  const [filterState, setFilterState] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const zonesSnap = await getDocs(query(collection(db, 'zones'), orderBy('name')));
        const nicheSnap = await getDocs(collection(db, 'niches'));

        setZones(zonesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setNiches(nicheSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredZones = zones.filter(z => {
    if (filterState && z.state !== filterState) return false;
    return true;
  });

  const getStatesList = () => [...new Set(zones.map(z => z.state))].sort();

  const copyShareLink = (state, niche, zone) => {
    const slug = zone.name.toLowerCase().replace(/ /g, '-');
    const url = `${window.location.origin}/${state.toLowerCase()}/${niche}/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="loading-container"><p>Loading zones...</p></div>;

  const niches_list = niches.map(n => n.id).sort();
  const states = getStatesList();

  return (
    <div className="sales-container">
      <header className="sales-header">
        <div>
          <h1>Sales Territory View</h1>
          <p className="last-updated">Last updated: {lastUpdated.toLocaleString()}</p>
        </div>
      </header>

      <div className="sales-filters">
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="zones-table-wrapper">
        <table className="zones-table">
          <thead>
            <tr>
              <th>Zone Name</th>
              <th>State</th>
              {niches_list.map(n => (
                <th key={n} style={{ textAlign: 'center' }}>
                  {niches.find(ni => ni.id === n)?.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredZones.map(zone => (
              <tr key={zone.id}>
                <td><strong>{zone.name}</strong></td>
                <td>{zone.state}</td>
                {niches_list.map(niche => {
                  const slot = zone.nicheSlots?.[niche];
                  const status = slot?.status || 'available';
                  const color = status === 'available' ? 'green' : status === 'taken' ? 'red' : 'gray';
                  const badgeClass = `badge-${color}`;

                  return (
                    <td key={niche} style={{ textAlign: 'center' }}>
                      {status !== 'hidden' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <span className={`badge ${badgeClass}`}>
                            {status === 'available' ? '✓ Open' : '✗ Taken'}
                          </span>
                          {status === 'available' && (
                            <button
                              className="btn-share"
                              title="Copy share link"
                              onClick={() => copyShareLink(zone.state, niche, zone)}
                            >
                              🔗
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
