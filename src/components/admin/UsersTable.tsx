import { useState } from 'react';
import type { AdminUser } from '../../hooks/useAdminUsers';

interface UsersTableProps {
  users: AdminUser[];
  currentAdminId: string;
  onStatusChange: (userId: string, newStatus: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onViewSalaryHistory: (userId: string, userName: string) => void;
  onEditRole: (user: AdminUser) => void;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#a259f7',
  STAFF: '#4d8ef0',
  EMPLOYEE: '#00c9a7',
  CUSTOMER: '#FF6B35',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00e5a0',
  PENDING: '#ff8c42',
  DEACTIVATED: '#4d7a9e',
  REJECTED: '#ff4c6a',
};

const cellStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'middle',
};

const badgeStyle = (color: string) => ({
  background: `${color}22`,
  color,
  border: `1px solid ${color}55`,
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'inline-flex',
});

const actionButtonStyle = {
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '8px',
};

const UsersTable = ({
  users,
  currentAdminId,
  onStatusChange,
  onDelete,
  onViewSalaryHistory,
  onEditRole,
}: UsersTableProps) => {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const runAction = async (key: string, action: () => Promise<void>) => {
    setLoadingActions((current) => ({ ...current, [key]: true }));

    try {
      await action();
    } finally {
      setLoadingActions((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
          <thead>
            <tr style={{ color: '#A0A0A0', textAlign: 'left', fontSize: '13px' }}>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Email</th>
              <th style={cellStyle}>Role</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Employee Role</th>
              <th style={cellStyle}>Employee Level</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentAdmin = user.id === currentAdminId;
              const statusActionKey = `${user.id}:status`;
              const deleteActionKey = `${user.id}:delete`;
              const statusLoading = loadingActions[statusActionKey];
              const deleteLoading = loadingActions[deleteActionKey];
              const canToggleStatus = user.status === 'ACTIVE' || user.status === 'DEACTIVATED';
              const nextStatus = user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

              return (
                <tr key={user.id}>
                  <td style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                  </td>
                  <td style={{ ...cellStyle, color: '#A0A0A0' }}>{user.email}</td>
                  <td style={cellStyle}>
                    <span style={badgeStyle(ROLE_COLORS[user.role] ?? '#A0A0A0')}>{user.role}</span>
                  </td>
                  <td style={cellStyle}>
                    <span style={badgeStyle(STATUS_COLORS[user.status] ?? '#A0A0A0')}>{user.status}</span>
                  </td>
                  <td style={cellStyle}>{user.employee_role ?? '-'}</td>
                  <td style={cellStyle}>{user.employee_level ?? '-'}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!isCurrentAdmin && canToggleStatus && (
                        <button
                          className="btn-ghost"
                          disabled={statusLoading}
                          onClick={() => runAction(statusActionKey, () => onStatusChange(user.id, nextStatus))}
                          style={actionButtonStyle}
                        >
                          {statusLoading ? 'Saving...' : nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'}
                        </button>
                      )}

                      {!isCurrentAdmin && (
                        <button
                          className="btn-ghost"
                          disabled={deleteLoading}
                          onClick={() => {
                            if (window.confirm(`Delete ${user.name}?`)) {
                              runAction(deleteActionKey, () => onDelete(user.id));
                            }
                          }}
                          style={{ ...actionButtonStyle, color: '#FF4C6A', borderColor: 'rgba(255,76,106,0.45)' }}
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      )}

                      {user.role === 'EMPLOYEE' && (
                        <>
                          <button
                            className="btn-ghost"
                            onClick={() => onViewSalaryHistory(user.id, user.name)}
                            style={actionButtonStyle}
                          >
                            Salary History
                          </button>
                          <button
                            className="btn-ghost"
                            onClick={() => onEditRole(user)}
                            style={actionButtonStyle}
                          >
                            Edit Role
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;
