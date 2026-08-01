import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartticket_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('smartticket_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('smartticket_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, isAdmin: user?.role === 'ROLE_ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
