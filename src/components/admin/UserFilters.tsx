import { useState } from 'react';

interface UserFiltersProps {
  onFilterChange: (role: string, status: string) => void;
}

const ROLE_OPTIONS = ['', 'ADMIN', 'STAFF', 'EMPLOYEE', 'CUSTOMER'];
const STATUS_OPTIONS = ['', 'ACTIVE', 'PENDING', 'DEACTIVATED', 'REJECTED'];

const UserFilters = ({ onFilterChange }: UserFiltersProps) => {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
    onFilterChange(nextRole, status);
  };

  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus);
    onFilterChange(role, nextStatus);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <select
        className="input-field"
        value={role}
        onChange={(event) => handleRoleChange(event.target.value)}
        style={{ maxWidth: '220px' }}
      >
        {ROLE_OPTIONS.map((option) => (
          <option key={option || 'ALL_ROLES'} value={option} style={{ background: '#111', color: '#fff' }}>
            {option || 'All Roles'}
          </option>
        ))}
      </select>

      <select
        className="input-field"
        value={status}
        onChange={(event) => handleStatusChange(event.target.value)}
        style={{ maxWidth: '220px' }}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option || 'ALL_STATUSES'} value={option} style={{ background: '#111', color: '#fff' }}>
            {option || 'All Statuses'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilters;
