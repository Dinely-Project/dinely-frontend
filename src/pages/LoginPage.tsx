import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading, login } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const token: string = res.data.token;
      const user = res.data.user;

      console.log('Login success. Role:', user.role);

      login(token, user);

      if (user.role === 'ADMIN') {
        navigate('/dinely/admin/dashboard', { replace: true });
        return;
      }
      if (user.role === 'STAFF') {
        navigate('/dinely/staff/dashboard', { replace: true });
        return;
      }
      if (user.role === 'EMPLOYEE') {
        navigate('/dinely/employee/dashboard', { replace: true });
        return;
      }
      if (user.role === 'CUSTOMER') {
        navigate('/dinely/customer/dashboard', { replace: true });
        return;
      }

      console.warn('Unknown role:', user.role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
            🍴 <span style={{ color: '#fff' }}>Din</span><span className="text-orange">ely</span>
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 700 }}>Welcome Back</h2>
          <p className="text-muted" style={{ fontSize: '15px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                className="input-field" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px'
                }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <a href="#" className="text-muted" style={{ fontSize: '13px' }}>Forgot Password?</a>
            </div>
          </div>
          
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255, 76, 106, 0.1)', border: '1px solid rgba(255, 76, 106, 0.2)', borderRadius: '10px', color: '#FF4C6A', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading} aria-busy={isLoading}>
            Sign In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ padding: '0 16px', color: '#A0A0A0', fontSize: '14px' }}>or</div>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '15px' }}>
            Don't have an account? <Link to="/register" className="text-orange" style={{ fontWeight: 600 }}>Register →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
