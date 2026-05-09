import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import DashboardLayout from './DashboardLayout';
import './index.css';

const globalStyles = `
  :root {
    --primary-color: #f39c12;
    --primary-hover: #e67e22;
    --secondary-color: #2c3e50;
    --background-color: #f4f7f6;
    --card-bg: #ffffff;
    --text-main: #333333;
    --text-muted: #7f8c8d;
    --border-color: #ecf0f1;
    --success: #2ecc71;
    --danger: #e74c3c;
  }

  body {
    background-color: var(--background-color);
    color: var(--text-main);
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .card {
    background: var(--card-bg);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    padding: 24px;
    border: 1px solid rgba(0,0,0,0.02);
  }

  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  button:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  button.secondary {
    background-color: transparent;
    color: var(--secondary-color);
    border: 2px solid #bdc3c7;
  }

  button.secondary:hover {
    background-color: #f8f9fa;
    border-color: var(--secondary-color);
  }

  input, select, textarea {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #bdc3c7;
    transition: border-color 0.2s;
    font-size: 1rem;
    outline: none;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
  }

  .badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .badge.success {
    background-color: rgba(46, 204, 113, 0.15);
    color: var(--success);
  }

  .badge.danger {
    background-color: rgba(231, 76, 60, 0.15);
    color: var(--danger);
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
  }

  th {
    background-color: #f8f9fa;
    color: var(--secondary-color);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 12px 16px;
    border-bottom: 2px solid var(--border-color);
  }

  td {
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .nav-tabs {
    display: flex;
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 32px;
  }

  .nav-tabs button {
    flex: 1;
    background: transparent;
    color: var(--text-muted);
    border-radius: 0;
    border-bottom: 3px solid transparent;
    padding: 16px 24px;
    margin-bottom: -1px;
  }

  .nav-tabs button:hover {
    transform: none;
    color: var(--primary-color);
    background: transparent;
  }

  .nav-tabs button.active {
    color: var(--primary-color);
    border-bottom: 3px solid var(--primary-color);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .inline-form {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .inline-form input {
    flex: 1;
    min-width: 150px;
  }
`;

function AppContent() {
  const { token } = useAuth();
  return token ? <DashboardLayout /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <>
        <style>{globalStyles}</style>
        <AppContent />
      </>
    </AuthProvider>
  );
}

export default App;
