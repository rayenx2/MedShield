import { useCallback, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, validateStoredAuthSession } from '../services/authApi';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'medshield.auth';

function readStoredSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (parsed?.token && parsed?.user?.role) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Tracks whether the localStorage session restore (below) has run yet.
  // ProtectedRoute must wait for this before deciding to redirect to
  // login — otherwise a hard refresh always bounces to login because
  // isAuthenticated is briefly false during the very first render.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const session = readStoredSession();
    if (!session || !validateStoredAuthSession(session)) {
      localStorage.removeItem(STORAGE_KEY);
      setInitializing(false);
      return;
    }
    setUser(session.user);
    setToken(session.token);
    setInitializing(false);
  }, []);

  const persistSession = useCallback((sessionUser, sessionToken) => {
    const payload = {
      token: sessionToken,
      user: sessionUser,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken('');
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginUser(credentials);
      setUser(result.user);
      setToken(result.token);
      persistSession(result.user, result.token);
      return result.user;
    } catch (err) {
      const nextError = err.message || 'Login failed.';
      setError(nextError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async ({ role, data }) => {
    setLoading(true);
    setError('');
    try {
      const result = await registerUser({ role, data });
      if (result.token && result.user) {
        setUser(result.user);
        setToken(result.token);
        persistSession(result.user, result.token);
      }
      return result;
    } catch (err) {
      const nextError = err.message || 'Registration failed.';
      setError(nextError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const clearError = useCallback(() => setError(''), []);

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role || '',
      isAuthenticated: Boolean(user && token),
      initializing,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, token, initializing, loading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
