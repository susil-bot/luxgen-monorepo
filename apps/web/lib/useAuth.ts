import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_CURRENT_USER } from '../graphql/queries/auth';
import { setAuthToken, removeAuthToken, getAuthToken } from './auth';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: getAuthToken(),
    loading: true,
    error: null,
  });

  // GraphQL mutations
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);

  // Get current user query
  const { data: currentUserData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER, {
    skip: !authState.token,
    errorPolicy: 'all',
  });

  // Update auth state when current user data changes
  useEffect(() => {
    if (currentUserData?.currentUser) {
      setAuthState(prev => ({
        ...prev,
        user: currentUserData.currentUser,
        loading: false,
        error: null,
      }));
    } else if (userError) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: userError.message,
      }));
    } else if (!userLoading && !currentUserData?.currentUser) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: null,
      }));
    }
  }, [currentUserData, userError, userLoading]);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });

      if (data?.login) {
        const { token, user } = data.login;
        setAuthToken(token);
        setAuthState({
          user,
          token,
          loading: false,
          error: null,
        });
        return { success: true, user, token };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    tenantId: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await registerMutation({
        variables: {
          input: userData
        }
      });

      if (data?.register) {
        const { token, user } = data.register;
        setAuthToken(token);
        setAuthState({
          user,
          token,
          loading: false,
          error: null,
        });
        return { success: true, user, token };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    removeAuthToken();
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  const isAuthenticated = () => {
    return !!authState.token && !!authState.user;
  };

  const isLoading = () => {
    return authState.loading || loginLoading || registerLoading;
  };

  return {
    // State
    user: authState.user,
    token: authState.token,
    loading: isLoading(),
    error: authState.error,
    
    // Actions
    login,
    register,
    logout,
    isAuthenticated,
  };
};
