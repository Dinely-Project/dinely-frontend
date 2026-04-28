import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 5%',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '64px',
      zIndex: 100
    }}>
      <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🍴</span>
        <span><span style={{ color: '#fff' }}>Din</span><span style={{ color: '#FF6B35' }}>ely</span></span>
      </Link>
      
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <a href="#home" style={{ color: '#A0A0A0', transition: 'color 0.2s', fontSize: '15px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = '#FF6B35'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Home</a>
        <a href="#menu" style={{ color: '#A0A0A0', transition: 'color 0.2s', fontSize: '15px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = '#FF6B35'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Menu</a>
        <a href="#about" style={{ color: '#A0A0A0', transition: 'color 0.2s', fontSize: '15px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = '#FF6B35'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>About</a>
        <a href="#specials" style={{ color: '#A0A0A0', transition: 'color 0.2s', fontSize: '15px', fontWeight: 500 }} onMouseOver={(e) => e.currentTarget.style.color = '#FF6B35'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Specials</a>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/login" style={{ color: '#A0A0A0', fontWeight: 500, fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Sign In</Link>
        <Link to="/register" style={{
          background: '#FF6B35', color: '#fff', borderRadius: '50px', fontWeight: 600, padding: '8px 20px', fontSize: '14px', transition: 'background 0.2s'
        }} onMouseOver={(e) => e.currentTarget.style.background = '#E85A24'} onMouseOut={(e) => e.currentTarget.style.background = '#FF6B35'}>Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
