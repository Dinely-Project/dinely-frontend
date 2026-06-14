import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const minChars = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!minChars || !hasUpper || !hasNumber) {
      setError('Please meet all password requirements.');
      return;
    }

    try {
      await api.post('/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
            <UtensilsCrossed size={22} style={{ marginRight: 8 }} /> <span style={{ color: '#fff' }}>Din</span><span className="text-orange">ely</span>
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>Create Account</h2>
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
            <div style={{ marginTop: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ color: minChars ? '#00C9A7' : '#555', transition: 'color 0.2s' }}>{minChars ? '✓' : '○'} At least 6 characters</div>
              <div style={{ color: hasUpper ? '#00C9A7' : '#555', transition: 'color 0.2s' }}>{hasUpper ? '✓' : '○'} At least 1 uppercase letter</div>
              <div style={{ color: hasNumber ? '#00C9A7' : '#555', transition: 'color 0.2s' }}>{hasNumber ? '✓' : '○'} At least 1 number</div>
            </div>
          </div>
          
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255, 76, 106, 0.1)', border: '1px solid rgba(255, 76, 106, 0.2)', borderRadius: '10px', color: '#FF4C6A', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>Create Account</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Already have an account? <Link to="/login" className="text-orange" style={{ fontWeight: 600 }}>Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
