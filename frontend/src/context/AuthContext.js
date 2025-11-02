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

  // Готовая компания для демонстрации
// В defaultCompany добавьте:
const defaultCompany = {
  id: 1,
  email: 'okadzaki@example.com',
  password: 'okadzaki123',
  role: 'business',
  companyName: 'Okadzaki Sushi',
  bin: '123456789012',
  directorFirstName: 'Айгерім',
  directorLastName: 'Қасенова',
  phone: '+7 (777) 123-45-67',
  city: 'Алматы',
  openingTime: '09:00',
  closingTime: '23:00',
  avatar: null,
  createdAt: new Date().toISOString()
};

  // Функция для инициализации демо-данных
  const initializeDemoData = () => {
    const savedUsers = localStorage.getItem('users');
    
    if (!savedUsers) {
      // Если нет пользователей, создаем демо компанию
      const initialUsers = [defaultCompany];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      console.log('Демо компания создана:', defaultCompany.email);
    } else {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      
      // Проверяем, есть ли демо компания
      const hasDemoCompany = parsedUsers.some(u => u.email === defaultCompany.email);
      if (!hasDemoCompany) {
        const updatedUsers = [...parsedUsers, defaultCompany];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('Демо компания добавлена');
      }
    }
  };

  // Функция для обновления данных пользователя
  const updateUser = (updatedUserData) => {
    const userForStorage = {
      ...updatedUserData,
      avatar: updatedUserData.avatar && updatedUserData.avatar.startsWith('data:image') 
        ? null 
        : updatedUserData.avatar
    };
    
    setUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === updatedUserData.id ? userForStorage : u
      )
    );
    
    const updatedUsers = users.map(u => 
      u.id === updatedUserData.id ? userForStorage : u
    );
    
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.warn('Не удалось сохранить users в localStorage:', error);
    }
  };

  const register = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      role: userData.role || 'customer',
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    
    const userForStorage = { ...newUser, avatar: null };
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    localStorage.setItem('users', JSON.stringify([...users, userForStorage]));
    
    return newUser;
  };

  const login = (email, password) => {
    console.log('Попытка входа:', email);
    console.log('Доступные пользователи:', users);
    
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      console.log('Пользователь найден:', foundUser);
      setUser(foundUser);
      const userForStorage = {
        ...foundUser,
        avatar: foundUser.avatar && foundUser.avatar.startsWith('data:image') 
          ? null 
          : foundUser.avatar
      };
      localStorage.setItem('currentUser', JSON.stringify(userForStorage));
      return foundUser;
    } else {
      console.log('Пользователь не найден или неверный пароль');
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    // Инициализируем демо-данные
    initializeDemoData();
    
    // Загружаем текущего пользователя
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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