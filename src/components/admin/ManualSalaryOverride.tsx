import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';
import { useAdminUsers, type AdminUser } from '../../hooks/useAdminUsers';

interface SalaryHistoryItem {
  id: string;
  old_salary: number | null;
  new_salary: number | null;
  trigger_type: string;
  reason: string | null;
  changed_at: string;
}

interface SalaryHistoryResponse {
  history?: SalaryHistoryItem[];
  data?: SalaryHistoryItem[];
}

interface SalaryUpdatePayload {
  salary: number;
  reason?: string;
}

const emptyDisplayValue = '\u2014';
const backLabel = '\u2190 Back';

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

const HistoryLoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
    <div style={{
      width: 32,
      height: 32,
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

const badgeStyle = {
  background: 'rgba(0,201,167,0.15)',
  color: '#00c9a7',
  border: '1px solid rgba(0,201,167,0.3)',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '13px',
  fontWeight: 700,
  display: 'inline-flex',
};

const actionButtonStyle = {
  padding: '10px 16px',
  fontSize: '14px',
};

const formatSalary = (salary: number | null) => {
  if (salary === null) {
    return `LKR ${emptyDisplayValue}`;
  }

  return `LKR ${salary.toLocaleString()}`;
};

const formatHistorySalary = (salary: number | null) => {
  if (salary === null) {
    return emptyDisplayValue;
  }

  return `LKR ${salary.toLocaleString()}`;
};

const formatHistoryDate = (value: string) => new Date(value).toLocaleString();

const formatRoleLevel = (employee: AdminUser) => {
  const role = employee.employee_role ?? 'GENERAL';

  if (employee.employee_level === null) {
    return role;
  }

  return `${role} Level ${employee.employee_level}`;
};

const getTriggerTypeBadgeStyle = (triggerType: string) => {
  if (triggerType === 'MANUAL_OVERRIDE') {
    return {
      background: 'rgba(255,107,53,0.15)',
      color: '#FF6B35',
      borderRadius: '999px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-flex',
    };
  }

  if (triggerType === 'CONFIG_UPDATE') {
    return {
      background: 'rgba(0,201,167,0.15)',
      color: '#00c9a7',
      borderRadius: '999px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-flex',
    };
  }

  return {
    background: 'rgba(255,255,255,0.08)',
    color: '#A0A0A0',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-flex',
  };
};

const ManualSalaryOverride: FC = () => {
  const { users, loading, error, refetch } = useAdminUsers({ role: 'EMPLOYEE' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<AdminUser | null>(null);
  const [newSalary, setNewSalary] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const returnTimerRef = useRef<number | null>(null);
  const historyRequestIdRef = useRef(0);
  const selectedEmployeeId = selectedEmployee?.id;

  useEffect(() => {
    return () => {
      if (returnTimerRef.current !== null) {
        window.clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  const fetchSalaryHistory = useCallback(async (employeeId: string) => {
    const requestId = historyRequestIdRef.current + 1;
    historyRequestIdRef.current = requestId;
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await api.get<SalaryHistoryResponse | SalaryHistoryItem[] | null>(`/api/admin/users/${employeeId}/salary-history`);
      const raw = response.data;

      if (historyRequestIdRef.current === requestId) {
        setSalaryHistory(Array.isArray(raw) ? raw : (raw?.history ?? raw?.data ?? []));
      }
    } catch (err: unknown) {
      if (historyRequestIdRef.current === requestId) {
        setHistoryError(getApiErrorMessage(err, 'Failed to load salary history.'));
        setSalaryHistory([]);
      }
    } finally {
      if (historyRequestIdRef.current === requestId) {
        setHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      historyRequestIdRef.current += 1;
      setSalaryHistory([]);
      setHistoryLoading(false);
      setHistoryError(null);
      return;
    }

    fetchSalaryHistory(selectedEmployeeId);
  }, [fetchSalaryHistory, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return users ?? [];
    }

    return (users ?? []).filter((employee) => (
      employee.name.toLowerCase().includes(normalizedQuery)
      || employee.email.toLowerCase().includes(normalizedQuery)
    ));
  }, [searchQuery, users]);

  const handleSelectEmployee = (employee: AdminUser) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.salary === null ? '' : String(employee.salary));
    setReason('');
    setUpdateError(null);
    setSuccessMessage(null);
    setSalaryHistory([]);
    setHistoryError(null);

    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  };

  const handleBack = () => {
    setSelectedEmployee(null);
    setNewSalary('');
    setReason('');
    setUpdateError(null);
    setSuccessMessage(null);
    setSalaryHistory([]);
    setHistoryLoading(false);
    setHistoryError(null);
    historyRequestIdRef.current += 1;

    if (returnTimerRef.current !== null) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedEmployee) {
      return;
    }

    const trimmedSalary = newSalary.trim();
    const salaryValue = Number(trimmedSalary);

    if (trimmedSalary.length === 0 || !Number.isFinite(salaryValue) || salaryValue < 0) {
      setUpdateError('Enter a valid salary.');
      return;
    }

    const trimmedReason = reason.trim();
    const payload: SalaryUpdatePayload = { salary: salaryValue };

    if (trimmedReason.length > 0) {
      payload.reason = trimmedReason;
    }

    setSaving(true);
    setUpdateError(null);
    setSuccessMessage(null);

    try {
      await api.patch(`/api/admin/users/${selectedEmployee.id}/salary`, payload);
      setSuccessMessage('Salary updated successfully');
      setSelectedEmployee({ ...selectedEmployee, salary: salaryValue });
      await refetch();
      await fetchSalaryHistory(selectedEmployee.id);

      if (returnTimerRef.current !== null) {
        window.clearTimeout(returnTimerRef.current);
      }

      returnTimerRef.current = window.setTimeout(() => {
        handleBack();
      }, 1500);
    } catch (err: unknown) {
      setUpdateError(getApiErrorMessage(err, 'Failed to update salary.'));
    } finally {
      setSaving(false);
    }
  };

  if (selectedEmployee) {
    return (
      <div className="glass-card" style={{ padding: '24px', maxWidth: '760px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>{selectedEmployee.name}</h2>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>{selectedEmployee.email}</p>
            <span style={badgeStyle}>{formatRoleLevel(selectedEmployee)}</span>
          </div>
          <button
            className="btn-ghost"
            type="button"
            disabled={saving}
            onClick={handleBack}
            style={actionButtonStyle}
          >
            {backLabel}
          </button>
        </div>

        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.25)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '22px',
        }}>
          <div className="text-muted" style={{ fontSize: '13px', marginBottom: '6px' }}>Current salary</div>
          <div style={{ color: '#FF6B35', fontSize: '24px', fontWeight: 700 }}>{formatSalary(selectedEmployee.salary)}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px', marginBottom: '18px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
            New Salary (LKR)
            <input
              className="input-field"
              type="number"
              value={newSalary}
              onChange={(event) => setNewSalary(event.target.value)}
              min="0"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#A0A0A0' }}>
            Reason (optional)
            <input
              className="input-field"
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        </div>

        {updateError && (
          <div style={{ color: '#FF4C6A', fontSize: '14px', marginBottom: '16px' }}>
            {updateError}
          </div>
        )}

        {successMessage && (
          <div style={{ color: '#00C9A7', fontSize: '14px', marginBottom: '16px' }}>
            {successMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-ghost"
            type="button"
            disabled={saving}
            onClick={handleBack}
            style={actionButtonStyle}
          >
            {backLabel}
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={saving}
            onClick={handleUpdateSalary}
            style={actionButtonStyle}
          >
            {saving ? 'Updating...' : 'Update Salary'}
          </button>
        </div>

        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          marginTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
        }}>
          Salary History
        </h3>

        {historyLoading && <HistoryLoadingSpinner />}

        {historyError && (
          <div style={{ color: '#FF4C6A', fontSize: '13px', marginTop: '14px' }}>
            {historyError}
          </div>
        )}

        {!historyLoading && !historyError && (salaryHistory ?? []).length === 0 && (
          <div style={{ color: '#A0A0A0', fontSize: '13px', marginTop: '14px' }}>
            No salary history yet.
          </div>
        )}

        {!historyLoading && !historyError && (salaryHistory ?? []).length > 0 && (
          <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '12px', color: '#A0A0A0', padding: '10px 8px', textAlign: 'left' }}>From</th>
                  <th style={{ fontSize: '12px', color: '#A0A0A0', padding: '10px 8px', textAlign: 'left' }}>To</th>
                  <th style={{ fontSize: '12px', color: '#A0A0A0', padding: '10px 8px', textAlign: 'left' }}>Type</th>
                  <th style={{ fontSize: '12px', color: '#A0A0A0', padding: '10px 8px', textAlign: 'left' }}>Reason</th>
                  <th style={{ fontSize: '12px', color: '#A0A0A0', padding: '10px 8px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {(salaryHistory ?? []).map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ fontSize: '13px', color: '#ccc', padding: '10px 8px' }}>{formatHistorySalary(item.old_salary)}</td>
                    <td style={{ fontSize: '13px', color: '#ccc', padding: '10px 8px' }}>{formatHistorySalary(item.new_salary)}</td>
                    <td style={{ fontSize: '13px', color: '#ccc', padding: '10px 8px' }}>
                      <span style={getTriggerTypeBadgeStyle(item.trigger_type)}>
                        {item.trigger_type}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#ccc', padding: '10px 8px' }}>{item.reason ?? emptyDisplayValue}</td>
                    <td style={{ fontSize: '13px', color: '#ccc', padding: '10px 8px' }}>{formatHistoryDate(item.changed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#A0A0A0', marginBottom: '20px' }}>
        Search employee by name or email
        <input
          className="input-field"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>

      {loading && <LoadingSpinner />}

      {error && (
        <div style={{
          color: '#FF4C6A',
          background: 'rgba(255,76,106,0.1)',
          border: '1px solid rgba(255,76,106,0.2)',
          borderRadius: '10px',
          padding: '14px 16px',
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {(filteredEmployees ?? []).map((employee) => (
            <button
              key={employee.id}
              type="button"
              className="glass-card"
              onClick={() => handleSelectEmployee(employee)}
              style={{
                width: '100%',
                padding: '16px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>{employee.name}</div>
                  <div className="text-muted" style={{ fontSize: '14px' }}>{employee.email}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                  <span style={badgeStyle}>{formatRoleLevel(employee)}</span>
                  <span style={{ color: '#FF6B35', fontWeight: 700 }}>{formatSalary(employee.salary)}</span>
                </div>
              </div>
            </button>
          ))}

          {(filteredEmployees ?? []).length === 0 && (
            <div className="text-muted" style={{ textAlign: 'center', padding: '40px 20px' }}>
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManualSalaryOverride;
