import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AdminZones from '../components/AdminZones';
import AdminNiches from '../components/AdminNiches';
import AdminSettings from '../components/AdminSettings';
import './Admin.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('zones');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <sidebar className="admin-sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: '#0057ff', margin: 0 }}>ReBoost</h2>
          <span className="sidebar-tagline">Territory Manager</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            📍 Zones
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'niches' ? 'active' : ''}`}
            onClick={() => setActiveTab('niches')}
          >
            🏢 Niches
          </button>
          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </sidebar>

      <main className="admin-main">
        {activeTab === 'zones' && <AdminZones />}
        {activeTab === 'niches' && <AdminNiches />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}
