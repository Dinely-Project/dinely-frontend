import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;

  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MutationState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;

}

interface UpdateEmailPayload {
  email: string;
  current_password: string;
}

interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
}

const initialMutationState: MutationState = {
  loading: false,
  error: null,
  success: null,
};

export const useCustomerProfile = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/customers/me');
      setProfile(response.data.data ?? response.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load profile. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile, setProfile };
};

export const useUpdateCustomerProfile = () => {
  const [state, setState] = useState<MutationState>(initialMutationState);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<CustomerProfile | null> => {
      setState({ loading: true, error: null, success: null });

      try {
        const response = await api.patch('/api/customers/me', payload);
        setState({ loading: false, error: null, success: 'Profile updated successfully.' });
        return (response.data.data ?? response.data) as CustomerProfile;
      } catch (err: unknown) {
        setState({
          loading: false,
          error: getApiErrorMessage(err, 'Failed to update profile. Please try again.'),
          success: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => setState(initialMutationState), []);

  return { ...state, updateProfile, reset };
};

export const useUpdateCustomerEmail = () => {
  const [state, setState] = useState<MutationState>(initialMutationState);

  const updateEmail = useCallback(async (payload: UpdateEmailPayload): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      await api.patch('/api/customers/me/email', payload);
      setState({ loading: false, error: null, success: 'Email updated successfully.' });
      return true;
    } catch (err: unknown) {
      setState({
        loading: false,
        error: getApiErrorMessage(err, 'Failed to update email. Please try again.'),
        success: null,
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => setState(initialMutationState), []);

  return { ...state, updateEmail, reset };
};

export const useUpdateCustomerPassword = () => {
  const [state, setState] = useState<MutationState>(initialMutationState);

  const updatePassword = useCallback(async (payload: UpdatePasswordPayload): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      await api.patch('/api/customers/me/password', payload);
      setState({ loading: false, error: null, success: 'Password updated successfully.' });
      return true;
    } catch (err: unknown) {
      setState({
        loading: false,
        error: getApiErrorMessage(err, 'Failed to update password. Please try again.'),
        success: null,
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => setState(initialMutationState), []);

  return { ...state, updatePassword, reset };
};
