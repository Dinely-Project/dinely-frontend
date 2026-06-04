import { useMemo, useState } from 'react';
import api from '../../api/axios';
import type { AdminUser } from '../../hooks/useAdminUsers';

interface EditRoleModalProps {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

const SUB_ROLE_OPTIONS = ['CHEF', 'SERVER', 'CLEANER', 'MANAGER', 'GENERAL'];

const LEVEL_OPTIONS: Record<string, number[]> = {
  CHEF: [1, 2, 3, 4, 5],
  SERVER: [1, 2, 3],
  CLEANER: [1, 2, 3],
  MANAGER: [1, 2, 3],
};

const getInitialSubRole = (role: string | null) => {
  if (role && SUB_ROLE_OPTIONS.includes(role)) {
    return role;
  }

  return 'GENERAL';
};

const EditRoleModal = ({ user, onClose, onSuccess }: EditRoleModalProps) => {
  const [subRole, setSubRole] = useState(getInitialSubRole(user.employee_role));
  const [level, setLevel] = useState(user.employee_level ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableLevels = useMemo(() => LEVEL_OPTIONS[subRole] ?? [], [subRole]);

  const handleSubRoleChange = (nextSubRole: string) => {
    const nextLevels = LEVEL_OPTIONS[nextSubRole] ?? [];

    setSubRole(nextSubRole);
    setLevel(nextLevels.includes(level) ? level : nextLevels[0] ?? 0);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await api.patch(`/api/admin/users/${user.id}/role`, {
        employee_role: subRole,
        employee_level: subRole === 'GENERAL' ? 0 : level,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update employee role', err);
      setError('Failed to update role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Edit Employee Role</h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>{user.name}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
            Sub-role
            <select
              className="input-field"
              value={subRole}
              onChange={(event) => handleSubRoleChange(event.target.value)}
            >
              {SUB_ROLE_OPTIONS.map((option) => (
                <option key={option} value={option} style={{ background: '#111', color: '#fff' }}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {subRole !== 'GENERAL' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
              Level
              <select
                className="input-field"
                value={level}
                onChange={(event) => setLevel(Number(event.target.value))}
              >
                {availableLevels.map((option) => (
                  <option key={option} value={option} style={{ background: '#111', color: '#fff' }}>
                    Level {option}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {error && (
          <div style={{ color: '#FF4C6A', marginTop: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
          <button className="btn-ghost" onClick={onClose} disabled={saving} style={{ padding: '10px 18px' }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 18px' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
