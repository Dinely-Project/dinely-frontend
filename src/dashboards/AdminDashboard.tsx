import React, { useContext, useState } from 'react';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import AdminOrdersPanel from '../components/admin/AdminOrdersPanel';
import { useNavigate } from 'react-router-dom';
import HRRequestsPanel from '../components/admin/HRRequestsPanel';
import ProfilePanel from '../components/admin/ProfilePanel';
import SalaryConfigPanel from '../components/admin/SalaryConfigPanel';
import UsersPanel from '../components/admin/UsersPanel';
import { ROLE_COLORS } from '../constants/colors';
import { AuthContext } from '../context/auth-context';

type ActivePanel = 'overview' | 'users' | 'orders' | 'salary' | 'hr-requests' | 'profile';

const AdminDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<ActivePanel>('overview');

  const handleLogout = () => {
    auth?.logout();
    navigate('/');
  };

  const navItems: { key: ActivePanel; icon: string; label: string }[] = [
    { key: 'overview', icon: 'OV', label: 'Overview' },
    { key: 'users', icon: 'US', label: 'Users' },
    { key: 'orders', icon: 'OR', label: 'Orders' },
    { key: 'hr-requests', icon: 'HR', label: 'HR Requests' },
    { key: 'salary', icon: 'SA', label: 'Salary Config' },
    { key: 'profile', icon: 'PR', label: 'Profile' },
  ];

  const renderMainContent = () => {
    if (activePanel === 'overview') {
      return <AnalyticsPanel />;
    }

    if (activePanel === 'users') {
      return <UsersPanel />;
    }

    if (activePanel === 'orders') {
      return <AdminOrdersPanel />;
    }

    if (activePanel === 'salary') {
      return <SalaryConfigPanel />;
    }

    if (activePanel === 'hr-requests') {
      return <HRRequestsPanel />;
    }

    if (activePanel === 'profile') {
      return <ProfilePanel />;
    }

    return (
      <div
        className="glass-card"
        style={{
          padding: '40px',
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="text-muted" style={{ fontSize: '18px' }}>Coming soon</div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <header style={{
        height: '70px',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ color: '#fff' }}>Din</span><span style={{ color: '#FF6B35' }}>ely</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 500 }}>{user?.name || 'Admin'}</span>
            <span style={{
              background: ROLE_COLORS[user?.role || 'ADMIN'],
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {user?.role || 'ADMIN'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '14px' }}
            onMouseOver={(event) => {
              event.currentTarget.style.borderColor = '#FF4C6A';
              event.currentTarget.style.color = '#FF4C6A';
            }}
            onMouseOut={(event) => {
              event.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              event.currentTarget.style.color = '#fff';
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{
          width: '260px',
          background: 'rgba(255,255,255,0.02)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {navItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setActivePanel(item.key)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: activePanel === item.key ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                color: activePanel === item.key ? '#FF6B35' : '#A0A0A0',
                cursor: 'pointer',
                fontWeight: activePanel === item.key ? 600 : 500,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ width: '24px', fontSize: '12px', fontWeight: 700 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
