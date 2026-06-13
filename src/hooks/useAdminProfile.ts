import { useCallback, useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/errors';

interface MutationState {
  loading: boolean;
  error: string | null;
  success: string | null;
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

export const useUpdateAdminEmail = () => {
  const [state, setState] = useState<MutationState>(initialMutationState);

  const updateEmail = useCallback(async (payload: UpdateEmailPayload): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      await api.patch('/api/admin/me/email', payload);
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

  return {
    ...state,
    updateEmail,
  };
};

export const useUpdateAdminPassword = () => {
  const [state, setState] = useState<MutationState>(initialMutationState);

  const updatePassword = useCallback(async (payload: UpdatePasswordPayload): Promise<boolean> => {
    if (payload.new_password.length < 8) {
      setState({
        loading: false,
        error: 'New password must be at least 8 characters.',
        success: null,
      });
      return false;
    }

    setState({ loading: true, error: null, success: null });

    try {
      await api.patch('/api/admin/me/password', payload);
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

  return {
    ...state,
    updatePassword,
  };
};
