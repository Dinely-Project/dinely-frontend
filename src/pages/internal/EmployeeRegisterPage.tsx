import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const EmployeeRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SERVER');
  const [level, setLevel] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getLevelOptions = () => {
    switch (role) {
      case 'CHEF': return [1, 2, 3, 4, 5];
      case 'SERVER':
      case 'CLEANER':
      case 'MANAGER': return [1, 2, 3];
      case 'GENERAL': return [];
      default: return [1];
    }
  };

  const levels = getLevelOptions();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      email,
      password,
      employee_role: role,
      employee_level: role === 'GENERAL' ? 0 : level
    };

    try {
      await api.post('/api/internal/register/employee', payload);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600 }}>
            Internal Portal — Employee Onboarding
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>Register Staff</h1>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <input 
              type="text" 
              placeholder="Full Name" 
              className="input-field" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="email" 
              placeholder="Email address" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <select 
              className="input-field" 
              value={role} 
              onChange={(e) => {
                setRole(e.target.value);
                setLevel(1);
              }}
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="SERVER" style={{ color: '#000' }}>Server</option>
              <option value="CHEF" style={{ color: '#000' }}>Chef</option>
              <option value="CLEANER" style={{ color: '#000' }}>Cleaner</option>
              <option value="MANAGER" style={{ color: '#000' }}>Manager</option>
              <option value="GENERAL" style={{ color: '#000' }}>General</option>
            </select>
          </div>

          {role !== 'GENERAL' && (
            <div>
              <select 
                className="input-field" 
                value={level} 
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                {levels.map(l => (
                  <option key={l} value={l} style={{ color: '#000' }}>Level {l}</option>
                ))}
              </select>
            </div>
          )}
          
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255, 76, 106, 0.1)', border: '1px solid rgba(255, 76, 106, 0.2)', borderRadius: '10px', color: '#FF4C6A', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>Register Staff</button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegisterPage;
