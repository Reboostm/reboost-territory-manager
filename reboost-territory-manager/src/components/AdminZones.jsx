import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import Papa from 'papaparse';
import './AdminZones.css';

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [niches, setNiches] = useState([]);
  const [filterState, setFilterState] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ status: 'available', clientName: '' });

  const [formData, setFormData] = useState({
    name: '',
    state: 'UT',
    cities: '',
    zips: '',
    lat: '',
    lng: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const zonesSnap = await getDocs(query(collection(db, 'zones'), orderBy('name')));
      const nicheSnap = await getDocs(collection(db, 'niches'));

      setZones(zonesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setNiches(nicheSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const cityArray = formData.cities.split(',').map(c => c.trim());
      const zipArray = formData.zips.split(',').map(z => z.trim());

      const nicheSlots = {};
      niches.forEach(niche => {
        nicheSlots[niche.id] = { status: 'available', clientName: '' };
      });

      await addDoc(collection(db, 'zones'), {
        name: formData.name,
        state: formData.state,
        cities: cityArray,
        zips: zipArray,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        nicheSlots,
      });

      setFormData({ name: '', state: 'UT', cities: '', zips: '', lat: '', lng: '' });
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      console.error('Error adding zone:', err);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          for (const row of results.data) {
            const cities = row.cities.split(';').map(c => c.trim());
            const zips = row.zips.split(';').map(z => z.trim());

            const nicheSlots = {};
            niches.forEach(niche => {
              nicheSlots[niche.id] = { status: 'available', clientName: '' };
            });

            await addDoc(collection(db, 'zones'), {
              name: row.zone_name,
              state: row.state,
              cities,
              zips,
              lat: parseFloat(row.lat),
              lng: parseFloat(row.lng),
              nicheSlots,
            });
          }
          setShowCSVUpload(false);
          await fetchData();
        } catch (err) {
          console.error('Error uploading CSV:', err);
        }
      },
    });
  };

  const handleUpdateSlot = async () => {
    const { zoneId, niche } = selectedSlot;
    const zoneRef = doc(db, 'zones', zoneId);
    const zone = zones.find(z => z.id === zoneId);

    await updateDoc(zoneRef, {
      [`nicheSlots.${niche}`]: slotForm,
    });

    setSelectedSlot(null);
    await fetchData();
  };

  const seedUtahData = async () => {
    const utahZones = [
      {
        name: 'Tooele County',
        state: 'UT',
        cities: ['Tooele', 'Grantsville', 'Stansbury Park', 'Rush Valley', 'Vernon'],
        zips: ['84074', '84029', '84083', '84078'],
        lat: 40.5469,
        lng: -112.2983,
      },
      {
        name: 'Salt Lake County - Central',
        state: 'UT',
        cities: ['Salt Lake City', 'Murray', 'Millcreek', 'Holladay', 'South Salt Lake'],
        zips: ['84101', '84102', '84103', '84107', '84117'],
        lat: 40.7608,
        lng: -111.8910,
      },
      {
        name: 'Salt Lake County - South',
        state: 'UT',
        cities: ['Sandy', 'Draper', 'Riverton', 'Herriman', 'South Jordan', 'Bluffdale'],
        zips: ['84070', '84095', '84065'],
        lat: 40.6150,
        lng: -111.8910,
      },
      {
        name: 'Salt Lake County - West',
        state: 'UT',
        cities: ['West Valley City', 'West Jordan', 'Taylorsville', 'Kearns', 'Magna'],
        zips: ['84119', '84120'],
        lat: 40.7200,
        lng: -111.9500,
      },
      {
        name: 'Davis County - North',
        state: 'UT',
        cities: ['Bountiful', 'Centerville', 'North Salt Lake', 'Woods Cross'],
        zips: ['84010', '84014'],
        lat: 40.8750,
        lng: -111.8820,
      },
      {
        name: 'Davis County - South',
        state: 'UT',
        cities: ['Layton', 'Kaysville', 'Clearfield', 'Syracuse', 'Clinton'],
        zips: ['84041', '84037'],
        lat: 40.9100,
        lng: -111.9300,
      },
      {
        name: 'Weber County',
        state: 'UT',
        cities: ['Ogden', 'Roy', 'Washington Terrace', 'South Ogden', 'Riverdale'],
        zips: ['84401', '84405'],
        lat: 41.2065,
        lng: -111.9790,
      },
      {
        name: 'Utah County - North',
        state: 'UT',
        cities: ['Provo', 'Orem', 'Lindon', 'Pleasant Grove', 'American Fork'],
        zips: ['84601', '84058'],
        lat: 40.2338,
        lng: -111.6585,
      },
      {
        name: 'Utah County - South',
        state: 'UT',
        cities: ['Spanish Fork', 'Springville', 'Payson', 'Salem', 'Santaquin'],
        zips: ['84660', '84663'],
        lat: 39.9270,
        lng: -111.6820,
      },
      {
        name: 'Cache County',
        state: 'UT',
        cities: ['Logan', 'North Logan', 'Providence', 'Smithfield', 'Hyrum'],
        zips: ['84321', '84341'],
        lat: 41.7370,
        lng: -111.8310,
      },
      {
        name: 'Washington County',
        state: 'UT',
        cities: ['St. George', 'Washington', 'Santa Clara', 'Ivins', 'Hurricane'],
        zips: ['84770', '84780'],
        lat: 37.0970,
        lng: -113.5640,
      },
      {
        name: 'Iron County',
        state: 'UT',
        cities: ['Cedar City', 'Enoch', 'Parowan'],
        zips: ['84720', '84721'],
        lat: 37.6765,
        lng: -113.0960,
      },
      {
        name: 'Box Elder County',
        state: 'UT',
        cities: ['Brigham City', 'Perry', 'Tremonton', 'Willard'],
        zips: ['84302', '84337'],
        lat: 41.5450,
        lng: -112.0130,
      },
      {
        name: 'Summit County',
        state: 'UT',
        cities: ['Park City', 'Heber City', 'Midway', 'Coalville'],
        zips: ['84060', '84032'],
        lat: 40.8460,
        lng: -111.4980,
      },
      {
        name: 'Sanpete County',
        state: 'UT',
        cities: ['Manti', 'Ephraim', 'Mount Pleasant', 'Moroni'],
        zips: ['84642', '84627'],
        lat: 39.2700,
        lng: -111.6140,
      },
    ];

    try {
      for (const zone of utahZones) {
        const nicheSlots = {};
        niches.forEach(niche => {
          nicheSlots[niche.id] = { status: 'available', clientName: '' };
        });

        await addDoc(collection(db, 'zones'), {
          ...zone,
          nicheSlots,
        });
      }
      await fetchData();
      alert('Utah zones seeded successfully!');
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  };

  const getStates = () => [...new Set(zones.map(z => z.state))].sort();
  const filteredZones = zones.filter(z => !filterState || z.state === filterState);

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-zones">
      <div className="section-header">
        <h2>Territory Zones</h2>
        <div className="button-group">
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            + Add Zone
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCSVUpload(!showCSVUpload)}>
            📤 Upload CSV
          </button>
          <button className="btn btn-success" onClick={seedUtahData}>
            🌾 Seed Utah Data
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddZone} className="form-card">
          <h3>Add New Zone</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Zone Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
                <option value="UT">UT</option>
                <option value="AZ">AZ</option>
                <option value="CO">CO</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cities (comma-separated)</label>
              <input
                value={formData.cities}
                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                placeholder="Salt Lake City, Murray, Millcreek"
                required
              />
            </div>
            <div className="form-group">
              <label>Zip Codes (comma-separated)</label>
              <input
                value={formData.zips}
                onChange={(e) => setFormData({ ...formData, zips: e.target.value })}
                placeholder="84101, 84102, 84103"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Create Zone</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
        </form>
      )}

      {showCSVUpload && (
        <div className="form-card">
          <h3>Upload CSV</h3>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
            Format: zone_name,state,cities,zips,lat,lng<br />
            Cities and zips separated by semicolons in quoted fields
          </p>
          <button className="btn btn-secondary" onClick={() => setShowCSVUpload(false)}>Close</button>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          <option value="">All States</option>
          {getStates().map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="zones-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>State</th>
              {niches.map(n => (
                <th key={n.id} style={{ textAlign: 'center', fontSize: 12 }}>{n.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredZones.map(zone => (
              <tr key={zone.id}>
                <td><strong>{zone.name}</strong></td>
                <td>{zone.state}</td>
                {niches.map(niche => {
                  const slot = zone.nicheSlots?.[niche.id];
                  const status = slot?.status || 'available';
                  const color = status === 'available' ? 'green' : status === 'taken' ? 'red' : 'gray';

                  return (
                    <td key={niche.id} style={{ textAlign: 'center' }}>
                      <button
                        className={`badge badge-${color} slot-badge`}
                        onClick={() => {
                          setSelectedSlot({ zoneId: zone.id, niche: niche.id });
                          setSlotForm({ status, clientName: slot?.clientName || '' });
                        }}
                      >
                        {status === 'available' ? '✓' : status === 'taken' ? '✗' : '◎'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Niche Slot</h3>
            <div className="form-group">
              <label>Status</label>
              <select value={slotForm.status} onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}>
                <option value="available">Available</option>
                <option value="taken">Taken</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="form-group">
              <label>Client Name (internal only)</label>
              <input
                value={slotForm.clientName}
                onChange={(e) => setSlotForm({ ...slotForm, clientName: e.target.value })}
                placeholder="Optional - for internal tracking"
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleUpdateSlot}>Save</button>
              <button className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
