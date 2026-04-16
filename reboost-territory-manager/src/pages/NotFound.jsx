import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>404</h1>
      <h2 style={{ marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: '#999', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <Link to="/check" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
