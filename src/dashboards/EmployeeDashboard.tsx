import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestsPanel from '../components/employee/RequestsPanel';
import NotificationBell from '../components/notifications/NotificationBell';
import { ROLE_COLORS } from '../constants/colors';
import { AuthContext } from '../context/auth-context';

type ActivePanel = 'overview' | 'profile' | 'requests';

const navItems: { key: ActivePanel; icon: string; label: string }[] = [
  { key: 'overview', icon: 'OV', label: 'Overview' },
  { key: 'profile', icon: 'PR', label: 'My Profile' },
  { key: 'requests', icon: 'RQ', label: 'My Requests' },
];

const EmployeeDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<ActivePanel>('overview');

  const subRoleLabel = user?.employee_role
    ? (user.employee_level ? `${user.employee_role} - Level ${user.employee_level}` : user.employee_role)
    : '-';
  const salaryLabel = user?.salary != null ? `LKR ${user.salary.toLocaleString()}` : '-';

  const handleLogout = () => {
    auth?.logout();
    navigate('/');
  };

  const renderProfileSummary = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {[
          { icon: 'RL',  label: 'Sub-Role', value: subRoleLabel },
          { icon: 'LKR', label: 'Salary',   value: salaryLabel,        valueColor: '#FF6B35' },
          { icon: 'ST',  label: 'Status',   value: user?.status || '-' },
          { icon: 'RO',  label: 'Role',     value: user?.role || '-'   },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#FF6B35',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '14px', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.valueColor ?? '#fff' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-primary" onClick={() => setActivePanel('requests')}>
        Submit a Request
      </button>
    </div>
  );

  const renderDetailedProfile = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { icon: 'RO', label: 'Role', value: user?.role || '-' },
          { icon: 'RL', label: 'Sub-Role', value: user?.employee_role || '-' },
          { icon: 'LV', label: 'Level', value: user?.employee_level ? `Level ${user.employee_level}` : '-' },
          { icon: 'LKR', label: 'Salary', value: salaryLabel, valueColor: '#FF6B35' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#FF6B35',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '14px', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.valueColor ?? '#fff' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: '32px' }}
        onClick={() => setActivePanel('requests')}
      >
        Submit a Request
      </button>
    </div>
  );

  const renderMainContent = () => {
    if (activePanel === 'requests') {
      return <RequestsPanel />;
    }

    if (activePanel === 'profile') {
      return renderDetailedProfile();
    }

    return (
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Employee Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '16px' }}>Welcome back, {user?.name || 'Employee'}</p>
        </div>
        {renderProfileSummary()}
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
          <span style={{ color: '#fff' }}>Din</span>
          <span style={{ color: '#FF6B35' }}>ely</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <NotificationBell />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 500 }}>{user?.name || 'Employee'}</span>
            <span style={{
              background: ROLE_COLORS[user?.role || 'EMPLOYEE'],
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {user?.role || 'EMPLOYEE'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '14px' }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#FF4C6A';
              e.currentTarget.style.color = '#FF4C6A';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
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
                background: activePanel === item.key ? 'rgba(255,107,53,0.1)' : 'transparent',
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

export default EmployeeDashboard;
