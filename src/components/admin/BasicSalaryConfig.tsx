import { useEffect, useMemo, useState, type FC } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';
import { useSalaryConfig, type SalaryConfigRow } from '../../hooks/useSalaryConfig';

const roleOrder = ['CHEF', 'SERVER', 'CLEANER', 'MANAGER', 'GENERAL'];

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

const actionButtonStyle = {
  padding: '8px 16px',
  fontSize: '13px',
};

const formatSalary = (salary: number) => `LKR ${salary.toLocaleString()}`;

const BasicSalaryConfig: FC = () => {
  const { configs, loading, error, refetch } = useSalaryConfig();
  const [selectedRole, setSelectedRole] = useState('CHEF');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const roleOptions = useMemo(() => {
    const roles = new Set(configs.map((config) => config.employee_role));
    const orderedRoles = roleOrder.filter((role) => roles.has(role));
    const extraRoles = configs
      .map((config) => config.employee_role)
      .filter((role, index, allRoles) => !roleOrder.includes(role) && allRoles.indexOf(role) === index);

    return [...orderedRoles, ...extraRoles];
  }, [configs]);

  const filteredConfigs = useMemo(
    () => configs.filter((config) => config.employee_role === selectedRole),
    [configs, selectedRole]
  );

  useEffect(() => {
    if (roleOptions.length > 0 && !roleOptions.includes(selectedRole)) {
      setSelectedRole(roleOptions[0]);
    }
  }, [roleOptions, selectedRole]);

  const handleEdit = (config: SalaryConfigRow) => {
    setEditingId(config.id);
    setEditValue(String(config.base_salary));
    setSaveError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
    setSaveError(null);
  };

  const handleSave = async (config: SalaryConfigRow) => {
    const trimmedSalary = editValue.trim();
    const nextSalary = Number(trimmedSalary);

    if (trimmedSalary.length === 0 || !Number.isFinite(nextSalary) || nextSalary < 0) {
      setSaveError('Enter a valid base salary.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const levelParam = config.employee_level === null ? 'null' : String(config.employee_level);

      await api.put(
        `/api/admin/salary-config/${encodeURIComponent(config.employee_role)}/${levelParam}`,
        { base_salary: nextSalary }
      );

      await refetch();
      handleCancel();
    } catch (err: unknown) {
      setSaveError(getApiErrorMessage(err, 'Failed to update salary configuration.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{
        color: '#FF4C6A',
        background: 'rgba(255,76,106,0.1)',
        border: '1px solid rgba(255,76,106,0.2)',
        borderRadius: '10px',
        padding: '14px 16px',
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {roleOptions.map((role) => {
          const isSelected = selectedRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                handleCancel();
              }}
              style={{
                background: isSelected ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.05)',
                color: isSelected ? '#FF6B35' : '#A0A0A0',
                border: isSelected ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {role}
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px',
      }}>
        {filteredConfigs.map((config) => {
          const isEditing = editingId === config.id;

          return (
            <div key={config.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#A0A0A0', fontSize: '12px', marginBottom: '6px' }}>Level</div>
                <div style={{ color: '#fff', fontSize: '28px', fontWeight: 700 }}>
                  {config.employee_level === null ? 'General' : config.employee_level}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#A0A0A0', fontSize: '12px', marginBottom: '6px' }}>Base Salary</div>
                {isEditing ? (
                  <input
                    className="input-field"
                    type="number"
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    min="0"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div style={{ color: '#FF6B35', fontSize: '20px', fontWeight: 700 }}>
                    {formatSalary(config.base_salary)}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-primary"
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(config)}
                    style={{ ...actionButtonStyle, flex: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    disabled={saving}
                    onClick={handleCancel}
                    style={{ ...actionButtonStyle, flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => handleEdit(config)}
                  style={{ ...actionButtonStyle, width: '100%' }}
                >
                  Edit
                </button>
              )}

              {isEditing && saveError && (
                <div style={{ color: '#FF4C6A', fontSize: '12px', marginTop: '10px' }}>
                  {saveError}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {configs.length === 0 && (
        <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
          No salary config rows found.
        </div>
      )}
    </div>
  );
};

export default BasicSalaryConfig;
