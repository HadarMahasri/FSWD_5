import { createContext, useState, useContext } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const loading = false;

  // 1. Initialize state directly from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    // If it exists, return the parsed object. If not, return null.
    return storedUser ? JSON.parse(storedUser) : null; 
  });

  const login = async (username, website) => {
    try {
      const users = await apiFetch(`http://localhost:5000/users?username=${username}&website=${website}`);
      
      if (users.length > 0) {
        const loggedInUser = users[0];
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return { success: true, user: loggedInUser };
      } else {
        return { success: false, message: 'Invalid username or password' };
      }
    } catch {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const checkUserExists = async (username) => {
    try {
      const users = await apiFetch(`http://localhost:5000/users?username=${username}`);
      return users.length > 0;
    } catch {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // ensure username is unique
      const exists = await checkUserExists(userData.username);
      if (exists) {
        return { success: false, message: 'Username already exists' };
      }

      const newUser = await apiFetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkUserExists }}>
      {children}
    </AuthContext.Provider>
  );
};
