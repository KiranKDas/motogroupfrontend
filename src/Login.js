import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, password);
      alert("Registered successfully! You can now log in.");
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, var(--secondary-color) 0%, #34495e 100%)' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '8px' }} className="mb-4">MotoGroup</h1>
        <h2 style={{ textAlign: 'center', fontWeight: '500', color: 'var(--text-main)' }} className="mb-4">Welcome Back</h2>
        {error && <p style={{ color: 'var(--danger)', textAlign: 'center', background: 'rgba(231,76,60,0.1)', padding: '10px', borderRadius: '8px' }} className="mb-3">{error}</p>}
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" style={{ marginTop: '10px', padding: '14px', fontSize: '1.1rem' }} onClick={handleLogin}>Login</button>
          <button type="button" className="secondary" style={{ padding: '14px', fontSize: '1.1rem' }} onClick={handleRegister}>Create Account</button>
        </form>
        <p className="text-muted" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>* Tip: Login as 'captain' to see Captain features</p>
      </div>
    </div>
  );
}