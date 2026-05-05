import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, website) => {
    try {
      const response = await fetch(`http://localhost:5000/users?username=${username}&website=${website}`);
      const users = await response.json();
      
      if (users.length > 0) {
        const loggedInUser = users[0];
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return { success: true };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const register = async (userData) => {
    try {
      const checkRes = await fetch(`http://localhost:5000/users?username=${userData.username}`);
      const existingUsers = await checkRes.json();
      if (existingUsers.length > 0) {
        return { success: false, message: 'Username already exists' };
      }

      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const newUser = await response.json();
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
