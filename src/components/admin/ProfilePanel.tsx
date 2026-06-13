import { useState, type CSSProperties, type FC, type FormEvent } from 'react';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../api/errors';

const formLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '14px',
  color: '#A0A0A0',
  marginBottom: '16px',
};

const errorBoxStyle: CSSProperties = {
  color: '#FF4C6A',
  background: 'rgba(255,76,106,0.1)',
  border: '1px solid rgba(255,76,106,0.2)',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '18px',
};

const buttonStyle = (loading: boolean) => ({
  padding: '13px 30px',
  fontSize: '14px',
  marginTop: '8px',
  opacity: loading ? 0.7 : 1,
  cursor: loading ? 'not-allowed' : 'pointer',
});

const EmailCard: FC = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch('/api/admin/me/email', {
        email,
        current_password: currentPassword,
      });
      setSuccess('Email updated successfully.');
      setEmail('');
      setCurrentPassword('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update email. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-card" style={{ padding: '24px' }} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Email Address</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Update your admin login email
      </p>

      <label style={formLabelStyle}>
        New Email Address
        <input
          className="input-field"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label style={formLabelStyle}>
        Current Password
        <input
          className="input-field"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </label>

      <button className="btn-primary" type="submit" disabled={loading} style={buttonStyle(loading)}>
        {loading ? 'Updating...' : 'Update Email'}
      </button>

      {error && <div style={{ ...errorBoxStyle, marginTop: '18px' }}>{error}</div>}
      {success && <div style={{ color: '#00C9A7', fontSize: '14px', marginTop: '12px' }}>{success}</div>}
    </form>
  );
};

const PasswordCard: FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch('/api/admin/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-card" style={{ padding: '24px' }} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Password</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Change your admin account password
      </p>

      <label style={formLabelStyle}>
        Current Password
        <input
          className="input-field"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </label>

      <label style={formLabelStyle}>
        New Password
        <input
          className="input-field"
          type="password"
          value={newPassword}
          minLength={8}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </label>

      <button className="btn-primary" type="submit" disabled={loading} style={buttonStyle(loading)}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>

      {error && <div style={{ ...errorBoxStyle, marginTop: '18px' }}>{error}</div>}
      {success && <div style={{ color: '#00C9A7', fontSize: '14px', marginTop: '12px' }}>{success}</div>}
    </form>
  );
};

const ProfilePanel: FC = () => (
  <section>
    <div style={{ marginBottom: '28px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Profile</h1>
      <p className="text-muted" style={{ fontSize: '16px' }}>Manage your admin account credentials.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <EmailCard />
      <PasswordCard />
    </div>
  </section>
);

export default ProfilePanel;
