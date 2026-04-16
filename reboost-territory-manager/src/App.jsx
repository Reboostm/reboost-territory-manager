import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Pages
import Login from './pages/Login';
import Admin from './pages/Admin';
import Sales from './pages/Sales';
import Check from './pages/Check';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

// Styles
import './App.css';

function PrivateRoute({ element, isAuth, isLoading }) {
  if (isLoading) return <div className="loading-container"><p>Loading...</p></div>;
  return isAuth ? element : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<PrivateRoute element={<Admin />} isAuth={user} isLoading={isLoading} />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/check" element={<Check />} />
        <Route path="/:state/:niche/:zone" element={<LandingPage />} />
        <Route path="/" element={<Navigate to="/check" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
