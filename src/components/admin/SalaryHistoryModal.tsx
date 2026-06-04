import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface SalaryHistoryModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

interface SalaryHistoryItem {
  id: string;
  employee_id: string;
  old_salary: number | null;
  new_salary: number | null;
  trigger_type: string;
  changed_by: string | null;
  reason: string | null;
  changed_at: string;
}

interface SalaryHistoryResponse {
  history?: SalaryHistoryItem[];
  salaryHistory?: SalaryHistoryItem[];
  salary_history?: SalaryHistoryItem[];
  data?: SalaryHistoryItem[] | {
    history?: SalaryHistoryItem[];
    salaryHistory?: SalaryHistoryItem[];
    salary_history?: SalaryHistoryItem[];
  };
}

const normalizeSalaryHistoryResponse = (
  payload: SalaryHistoryItem[] | SalaryHistoryResponse
): SalaryHistoryItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.history)) {
    return payload.history;
  }

  if (Array.isArray(payload.salaryHistory)) {
    return payload.salaryHistory;
  }

  if (Array.isArray(payload.salary_history)) {
    return payload.salary_history;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    if (Array.isArray(payload.data.history)) {
      return payload.data.history;
    }

    if (Array.isArray(payload.data.salaryHistory)) {
      return payload.data.salaryHistory;
    }

    if (Array.isArray(payload.data.salary_history)) {
      return payload.data.salary_history;
    }
  }

  return [];
};

const formatSalary = (salary: number | null) => {
  if (salary === null) {
    return 'LKR -';
  }

  return `LKR ${salary.toLocaleString()}`;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const SalaryHistoryModal = ({ userId, userName, onClose }: SalaryHistoryModalProps) => {
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSalaryHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<SalaryHistoryItem[] | SalaryHistoryResponse>(`/api/admin/users/${userId}/salary-history`);

        if (isMounted) {
          setHistory(normalizeSalaryHistoryResponse(response.data));
        }
      } catch (err) {
        console.error('Failed to fetch salary history', err);

        if (isMounted) {
          setError('Failed to load salary history.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSalaryHistory();

    return () => {
      isMounted = false;
    };
  }, [userId]);

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
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Salary History</h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>{userName}</p>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '8px 14px', fontSize: '14px' }}>
            Close
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(255,107,53,0.2)',
              borderTopColor: '#FF6B35',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        )}

        {error && (
          <div style={{ color: '#FF4C6A', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr style={{ color: '#A0A0A0', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Old Salary</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>New Salary</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Trigger Type</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Changed At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {formatSalary(item.old_salary)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {formatSalary(item.new_salary)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {item.trigger_type}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {formatDate(item.changed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && (
              <div className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                No salary changes yet.
              </div>
            )}
          </div>
        )}

        <style>
          {`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}
        </style>
      </div>
    </div>
  );
};

export default SalaryHistoryModal;
