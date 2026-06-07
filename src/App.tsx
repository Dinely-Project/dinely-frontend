import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AuthContext } from './context/auth-context';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeRegisterPage from './pages/internal/EmployeeRegisterPage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';

const FallbackRedirect = () => {
  const authContext = useContext(AuthContext);

  if (!authContext || authContext.loading) {
    return null;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/internal/register/employee" element={<EmployeeRegisterPage />} />

            {/* Public menu browse — no login required */}
            <Route path="/menu" element={<MenuPage />} />

            {/* Cart — accessible publicly (redirects to login on place order if not authed) */}
            <Route path="/cart" element={<CartPage />} />

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/dinely/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route path="/dinely/staff/dashboard" element={<StaffDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
              <Route path="/dinely/employee/dashboard" element={<EmployeeDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/dinely/customer/dashboard" element={<CustomerDashboard />} />
            </Route>

            <Route path="*" element={<FallbackRedirect />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
