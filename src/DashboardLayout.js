import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Garage from './Garage';
import Clubs from './Clubs';
import Events from './Events';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div>
      <header className="flex-between" style={{ backgroundColor: 'var(--card-bg)', padding: '16px 5%', borderBottom: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>MotoGroup</h1>
        </div>
        <div className="flex-between" style={{ gap: '24px' }}>
          <span style={{ fontWeight: 500 }}>
            Welcome, <strong style={{ color: 'var(--secondary-color)' }}>{user?.username}</strong>{' '}
            <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>{user?.isCaptain ? 'Captain' : 'Rider'}</span>
          </span>
          <button type="button" className="secondary" style={{ position: 'relative', zIndex: 50, cursor: 'pointer', padding: '8px 16px' }} onClick={logout}>Logout</button>
        </div>
      </header>
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <nav className="nav-tabs">
          <button className={activeTab === 'garage' ? 'active' : ''} onClick={() => setActiveTab('garage')}>My Garage</button>
          <button className={activeTab === 'clubs' ? 'active' : ''} onClick={() => setActiveTab('clubs')}>Clubs & Safety</button>
          <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>Events</button>
        </nav>
        {activeTab === 'garage' && <Garage />}
        {activeTab === 'clubs' && <Clubs setActiveTab={setActiveTab} />}
        {activeTab === 'events' && <Events />}
      </main>
    </div>
  );
}