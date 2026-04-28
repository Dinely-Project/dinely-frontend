import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#a259f7',
  STAFF: '#4d8ef0',
  EMPLOYEE: '#00c9a7',
  CUSTOMER: '#FF6B35',
};

const StaffDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();

  const handleLogout = () => {
    auth?.logout();
    navigate('/');
  };

  const navItems = [
    { icon: '🏠', label: 'Overview' },
    { icon: '📋', label: 'Orders' },
    { icon: '📦', label: 'Menu Management' },
    { icon: '👤', label: 'Profile' },
    { icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <header style={{ 
        height: '70px', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ color: '#fff' }}>Din</span><span style={{ color: '#FF6B35' }}>ely</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 500 }}>{user?.name || 'Staff User'}</span>
            <span style={{ 
              background: ROLE_COLORS[user?.role || 'STAFF'], color: '#fff', 
              padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 600 
            }}>
              {user?.role || 'STAFF'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 16px', fontSize: '14px' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#FF4C6A'; e.currentTarget.style.color = '#FF4C6A'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}>
            Log Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ 
          width: '260px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.08)',
          padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          {navItems.map((item, idx) => (
            <div key={idx} style={{ 
              padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px',
              background: idx === 0 ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
              color: idx === 0 ? '#FF6B35' : '#A0A0A0', cursor: 'pointer',
              fontWeight: idx === 0 ? 600 : 500, transition: 'all 0.2s'
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Staff Dashboard</h1>
            <p className="text-muted" style={{ fontSize: '16px' }}>Welcome back, {user?.name || 'Staff'} 👋</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {[
              { icon: '📈', label: 'Total Orders' },
              { icon: '💵', label: 'Revenue' },
              { icon: '📦', label: 'Menu Items' },
              { icon: '🔥', label: 'Hot Items' }
            ].map((stat, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '14px', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>—</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '40px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>📊 Recent Activity</h2>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#A0A0A0' }}>
              No activity yet. Check back later.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
