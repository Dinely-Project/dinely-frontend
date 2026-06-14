import React, { useContext, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { AuthContext } from '../../../context/auth-context';
import {
  useCustomerProfile,
  useUpdateCustomerEmail,
  useUpdateCustomerPassword,
  useUpdateCustomerProfile,
} from '../../../hooks/useCustomerProfile';

import { AUTH_TOKEN_KEY } from '../../../api/axios';

// ── Shared styles ────────────────────────────────────────────────────────────

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

const successTextStyle: CSSProperties = {
  color: '#00C9A7',
  fontSize: '14px',
  marginTop: '12px',
};

const buttonStyle = (loading: boolean): CSSProperties => ({
  padding: '13px 30px',
  fontSize: '14px',
  marginTop: '8px',
  opacity: loading ? 0.7 : 1,
  cursor: loading ? 'not-allowed' : 'pointer',
});

const Spinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Profile details card (name, phone) ───────────────────────────────────────

const ProfileDetailsCard: React.FC = () => {
  const auth = useContext(AuthContext);
  const { profile, loading, error, refetch, setProfile } = useCustomerProfile();
  const { loading: saving, error: saveError, success, updateProfile, reset } =
    useUpdateCustomerProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');

    }
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();
    setFormError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setFormError('Name must be at least 2 characters long.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^\+?[0-9\s\-().]{7,20}$/.test(trimmedPhone)) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    const updated = await updateProfile({
      name: trimmedName,
      phone: trimmedPhone === '' ? null : trimmedPhone,
    });

    if (updated) {
      setProfile(updated);
      const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
      if (auth?.user) {
        auth.login(token, {
          ...auth.user,
          name: updated.name,
          phone: updated.phone,
        });
      }
    }
  };



  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={errorBoxStyle}>{error}</div>
        <button type="button" className="btn-ghost" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <form className="glass-card" style={{ padding: '24px' }} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Account Details</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Update your personal information
      </p>



      <label style={formLabelStyle}>
        Full Name
        <input
          className="input-field"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
      </label>

      <label style={formLabelStyle}>
        Phone Number
        <input
          className="input-field"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="e.g. +94 77 123 4567"
          maxLength={20}
        />
      </label>

      <label style={formLabelStyle}>
        Email Address
        <input
          className="input-field"
          type="email"
          value={profile?.email ?? ''}
          disabled
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
        />
      </label>

      <button className="btn-primary" type="submit" disabled={saving} style={buttonStyle(saving)}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {(formError || saveError) && (
        <div style={{ ...errorBoxStyle, marginTop: '18px' }}>{formError || saveError}</div>
      )}
      {success && <div style={successTextStyle}>{success}</div>}
    </form>
  );
};

// ── Email update card ───────────────────────────────────────────────────────

const EmailCard: React.FC<{ currentEmail: string; onEmailUpdated: (email: string) => void }> = ({
  currentEmail,
  onEmailUpdated,
}) => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const { loading, error, success, updateEmail, reset } = useUpdateCustomerEmail();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const ok = await updateEmail({ email, current_password: currentPassword });
    if (ok) {
      onEmailUpdated(email);
      setEmail('');
      setCurrentPassword('');
    }
  };

  return (
    <form className="glass-card" style={{ padding: '24px' }} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Email Address</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Current email: {currentEmail}
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
      {success && <div style={successTextStyle}>{success}</div>}
    </form>
  );
};

// ── Password update card ────────────────────────────────────────────────────

const PasswordCard: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { loading, error, success, updatePassword, reset } = useUpdateCustomerPassword();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();
    setValidationError(null);

    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setValidationError('New password must include at least one uppercase letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('New password and confirmation do not match.');
      return;
    }

    const ok = await updatePassword({ current_password: currentPassword, new_password: newPassword });
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <form className="glass-card" style={{ padding: '24px' }} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Password</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Change your account password
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
          minLength={6}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </label>

      <label style={formLabelStyle}>
        Confirm New Password
        <input
          className="input-field"
          type="password"
          value={confirmPassword}
          minLength={6}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </label>

      <p className="text-muted" style={{ fontSize: '12px', marginTop: '-8px', marginBottom: '16px' }}>
        Must be at least 6 characters and include an uppercase letter and a number.
      </p>

      <button className="btn-primary" type="submit" disabled={loading} style={buttonStyle(loading)}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>

      {(validationError || error) && (
        <div style={{ ...errorBoxStyle, marginTop: '18px' }}>{validationError || error}</div>
      )}
      {success && <div style={successTextStyle}>{success}</div>}
    </form>
  );
};

// ── Account info card (read-only metadata) ──────────────────────────────────

const AccountInfoCard: React.FC<{ profile: { role: string; status: string; created_at: string } }> = ({
  profile,
}) => {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Account Information</h2>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
        Read-only account details
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Account Type</span>
          <span style={{ fontWeight: 600 }}>{profile.role}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Account Status</span>
          <span style={{ fontWeight: 600, color: profile.status === 'ACTIVE' ? '#00C9A7' : '#FF4C6A' }}>
            {profile.status}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Member Since</span>
          <span style={{ fontWeight: 600 }}>{formatDate(profile.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main panel ───────────────────────────────────────────────────────────────

const CustomerProfilePanel: React.FC = () => {
  const { profile, loading, error, refetch, setProfile } = useCustomerProfile();

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Profile</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>
          Manage your account details.
        </p>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={errorBoxStyle}>{error}</div>
          <button type="button" className="btn-ghost" onClick={refetch}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <ProfileDetailsCard />
          </div>
          <EmailCard
            currentEmail={profile.email}
            onEmailUpdated={(email) => setProfile({ ...profile, email })}
          />
          <PasswordCard />
          <AccountInfoCard profile={profile} />
        </div>
      )}
    </section>
  );
};

export default CustomerProfilePanel;
