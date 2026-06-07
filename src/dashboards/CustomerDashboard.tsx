import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { ROLE_COLORS } from '../constants/colors';
import { useCart } from '../context/CartContext';
import NotificationBell from '../components/notifications/NotificationBell';
import ActiveOrdersPanel from '../components/customer/orders/ActiveOrdersPanel';
import OrderHistoryPanel from '../components/customer/history/OrderHistoryPanel';

type ActiveSection = 'Overview' | 'My Orders' | 'Order History' | 'Profile' | 'Settings';

const navItems: { icon: string; label: ActiveSection }[] = [
  { icon: '🏠', label: 'Overview' },
  { icon: '📋', label: 'My Orders' },
  { icon: '🕐', label: 'Order History' },
  { icon: '👤', label: 'Profile' },
  { icon: '⚙️', label: 'Settings' },
];

const CustomerDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [activeSection, setActiveSection] = useState<ActiveSection>('Overview');

  const handleLogout = () => {
    auth?.logout();
    navigate('/');
  };

  const renderMain = () => {
    if (activeSection === 'My Orders') {
      return <ActiveOrdersPanel />;
    }

    if (activeSection === 'Order History') {
      return <OrderHistoryPanel />;
    }

    // Overview (and stubs for Profile / Settings)
    return (
      <div>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
            Customer Dashboard
          </h1>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Welcome back, {user?.name || 'Customer'} 👋
          </p>
        </div>

        {/* Quick action cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <Link
            to="/menu"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                border: '1px solid rgba(255,107,53,0.2)',
              }}
            >
              <span style={{ fontSize: '28px' }}>🍽️</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                  Browse Menu
                </p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  View available items and add to cart
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/cart"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                border: totalItems > 0 ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content' }}>
                <span style={{ fontSize: '28px' }}>🛒</span>
                {totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      background: '#FF6B35',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                  My Cart
                </p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  {totalItems > 0
                    ? `${totalItems} item${totalItems !== 1 ? 's' : ''} ready to order`
                    : 'Your cart is empty'}
                </p>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setActiveSection('My Orders')}
            style={{
              textAlign: 'left',
              background: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '28px' }}>📡</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#fff' }}>
                  Track Order
                </p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  Live status of your active orders
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('Order History')}
            style={{
              textAlign: 'left',
              background: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '28px' }}>🕐</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#fff' }}>
                  Order History
                </p>
                <p className="text-muted" style={{ fontSize: '13px' }}>
                  View past and cancelled orders
                </p>
              </div>
            </div>
          </button>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '40px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
            📊 Recent Activity
          </h2>
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#A0A0A0',
            }}
          >
            No activity yet. Check back later.
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          height: '70px',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ color: '#fff' }}>Din</span>
          <span style={{ color: '#FF6B35' }}>ely</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Cart link */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: totalItems > 0 ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${totalItems > 0 ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: totalItems > 0 ? '#FF6B35' : '#A0A0A0',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            🛒
            {totalItems > 0 && (
              <span
                style={{
                  background: '#FF6B35',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Browse menu link */}
          <Link
            to="/menu"
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#A0A0A0',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            🍽️ Menu
          </Link>

          {/* 🔔 Notification Bell */}
          <NotificationBell />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 500 }}>{user?.name || 'Customer'}</span>
            <span
              style={{
                background: ROLE_COLORS[user?.role || 'CUSTOMER'],
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {user?.role || 'CUSTOMER'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Log Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          style={{
            width: '260px',
            background: 'rgba(255,255,255,0.02)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveSection(item.label)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background:
                  activeSection === item.label
                    ? 'rgba(255, 107, 53, 0.1)'
                    : 'transparent',
                color: activeSection === item.label ? '#FF6B35' : '#A0A0A0',
                cursor: 'pointer',
                fontWeight: activeSection === item.label ? 600 : 500,
                transition: 'all 0.2s',
                border: 'none',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* ── Sidebar quick links ──────────────────────────────────── */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Link
              to="/menu"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#A0A0A0',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid rgba(255,107,53,0.2)',
                background: 'rgba(255,107,53,0.04)',
              }}
            >
              <span>🍽️</span>
              <span>Browse Menu</span>
            </Link>
            <Link
              to="/cart"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#A0A0A0',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>🛒</span>
                <span>View Cart</span>
              </div>
              {totalItems > 0 && (
                <span
                  style={{
                    background: '#FF6B35',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {renderMain()}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
