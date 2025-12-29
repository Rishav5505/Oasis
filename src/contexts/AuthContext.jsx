import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user info
      axios.get('http://localhost:5002/api/auth/me')
        .then(res => {
          setUser({ id: res.data._id, role: res.data.role });
          setMustChangePassword(res.data.mustChangePassword || false);
        })
        .catch(err => {
          console.error('Error fetching user:', err);
          sessionStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5002/api/auth/login', { email, password });
    const { token: receivedToken, role, id, mustChangePassword: mcp } = res.data;

    setToken(receivedToken);
    sessionStorage.setItem('token', receivedToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

    setUser({ id, role });
    setMustChangePassword(mcp || false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, mustChangePassword, setMustChangePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};