import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <Navigate to="/login" replace />;
  }

  const { user, loading } = authContext;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(255,107,53,0.2)',
          borderTopColor: '#FF6B35',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}
        </style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const routes: Record<string, string> = {
      ADMIN: '/dinely/admin/dashboard',
      STAFF: '/dinely/staff/dashboard',
      EMPLOYEE: '/dinely/employee/dashboard',
      CUSTOMER: '/dinely/customer/dashboard',
    };
    return <Navigate to={routes[user.role] ?? '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
