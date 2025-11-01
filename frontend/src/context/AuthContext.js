import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Функция для обновления данных пользователя
  const updateUser = (updatedUserData) => {
    // Не сохраняем avatar в localStorage если это base64 (слишком большой)
    const userForStorage = {
      ...updatedUserData,
      avatar: updatedUserData.avatar && updatedUserData.avatar.startsWith('data:image') 
        ? null 
        : updatedUserData.avatar
    };
    
    setUser(updatedUserData);
    
    // Обновляем в localStorage (без большого avatar)
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    
    // Обновляем в списке пользователей (тоже без большого avatar)
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === updatedUserData.id ? userForStorage : u
      )
    );
    
    // Обновляем users в localStorage (без больших avatar)
    const updatedUsers = users.map(u => 
      u.id === updatedUserData.id ? userForStorage : u
    );
    
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.warn('Не удалось сохранить users в localStorage:', error);
      // Если не помещается, сохраняем только основные данные
      const minimalUsers = updatedUsers.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        nickname: u.nickname,
        role: u.role,
        createdAt: u.createdAt
      }));
      localStorage.setItem('users', JSON.stringify(minimalUsers));
    }
  };

  const register = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'customer',
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    
    // Сохраняем без avatar
    const userForStorage = { ...newUser, avatar: null };
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    
    try {
      localStorage.setItem('users', JSON.stringify([...users, userForStorage]));
    } catch (error) {
      console.warn('Не удалось сохранить users в localStorage:', error);
    }
    
    return newUser;
  };

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      // Сохраняем без большого avatar
      const userForStorage = {
        ...foundUser,
        avatar: foundUser.avatar && foundUser.avatar.startsWith('data:image') 
          ? null 
          : foundUser.avatar
      };
      localStorage.setItem('currentUser', JSON.stringify(userForStorage));
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const value = {
    user,
    users,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};