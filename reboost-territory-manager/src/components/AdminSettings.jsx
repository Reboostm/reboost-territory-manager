import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    calendarUrl: '',
    agencyName: 'ReBoost',
    tagline: 'Territory Marketing Agency',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      const settingsObj = {};

      settingsSnap.docs.forEach(doc => {
        settingsObj[doc.id] = doc.data();
      });

      setSettings({
        calendarUrl: settingsObj.booking?.calendarUrl || '',
        agencyName: settingsObj.brand?.agencyName || 'ReBoost',
        tagline: settingsObj.brand?.tagline || 'Territory Marketing Agency',
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Save booking settings
      await setDoc(doc(db, 'settings', 'booking'), {
        calendarUrl: settings.calendarUrl,
      });

      // Save brand settings
      await setDoc(doc(db, 'settings', 'brand'), {
        agencyName: settings.agencyName,
        tagline: settings.tagline,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="admin-settings">
      <h2>Settings</h2>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h3>Booking Calendar</h3>
          <div className="form-group">
            <label>GHL Calendar URL</label>
            <input
              type="url"
              value={settings.calendarUrl}
              onChange={(e) => setSettings({ ...settings, calendarUrl: e.target.value })}
              placeholder="https://calendar.gohighlight.com/..."
            />
            <p className="help-text">This URL is used for the "Book Free Strategy Call" buttons on public pages.</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Brand Settings</h3>
          <div className="form-group">
            <label>Agency Name</label>
            <input
              value={settings.agencyName}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Agency Tagline</label>
            <input
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Save Settings</button>

        {saved && <p style={{ color: '#10b981', marginTop: 12 }}>✓ Settings saved successfully!</p>}
      </form>
    </div>
  );
}
