import { useContext, useState } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/auth-context';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import type { AdminUser } from '../../hooks/useAdminUsers';
import EditRoleModal from './EditRoleModal';
import SalaryHistoryModal from './SalaryHistoryModal';
import UserFilters from './UserFilters';
import UsersTable from './UsersTable';

interface SalaryHistoryTarget {
  userId: string;
  userName: string;
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
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

const UsersPanel = () => {
  const authContext = useContext(AuthContext);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [salaryHistoryTarget, setSalaryHistoryTarget] = useState<SalaryHistoryTarget | null>(null);
  const [editRoleTarget, setEditRoleTarget] = useState<AdminUser | null>(null);
  const { users, loading, error, refetch } = useAdminUsers({ role: roleFilter, status: statusFilter });

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
    await refetch();
  };

  const handleDelete = async (userId: string) => {
    await api.delete(`/api/admin/users/${userId}`);
    await refetch();
  };

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>User Management</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>Manage accounts, employee roles, and account access.</p>
      </div>

      <UserFilters
        onFilterChange={(role, status) => {
          setRoleFilter(role);
          setStatusFilter(status);
        }}
      />

      {loading && <LoadingSpinner />}

      {error && (
        <div style={{
          color: '#FF4C6A',
          background: 'rgba(255,76,106,0.1)',
          border: '1px solid rgba(255,76,106,0.2)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '18px'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <UsersTable
          users={users}
          currentAdminId={authContext?.user?.id ?? ''}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onViewSalaryHistory={(userId, userName) => setSalaryHistoryTarget({ userId, userName })}
          onEditRole={setEditRoleTarget}
        />
      )}

      {salaryHistoryTarget && (
        <SalaryHistoryModal
          userId={salaryHistoryTarget.userId}
          userName={salaryHistoryTarget.userName}
          onClose={() => setSalaryHistoryTarget(null)}
        />
      )}

      {editRoleTarget && (
        <EditRoleModal
          user={editRoleTarget}
          onClose={() => setEditRoleTarget(null)}
          onSuccess={refetch}
        />
      )}
    </section>
  );
};

export default UsersPanel;
