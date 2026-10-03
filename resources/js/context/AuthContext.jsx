import { createContext, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEY } from '@/lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return setReady(true);
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true));
  }, []);

  const login = (token, u) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
  };

  const logout = () => {
    // api() membaca token secara sinkron, jadi token masih terkirim sebelum dihapus di bawah.
    api('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, login, logout, ready }}>{children}</AuthContext.Provider>;
}
