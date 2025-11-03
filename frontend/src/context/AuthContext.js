// src/context/AuthContext.js
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
  const [isInitialized, setIsInitialized] = useState(false); // Добавляем флаг инициализации

  // Администраторы по умолчанию
  const defaultAdmins = [
    {
      id: 999,
      nickname: 'Главный Админ',
      email: 'admin@lowlow.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 998,
      nickname: 'Администратор',
      email: 'admin',
      password: 'admin',
      role: 'admin', 
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Демо компания
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
    isActive: true,
    createdAt: new Date().toISOString()
  };

  // Функция для инициализации данных
  const initializeDemoData = () => {
    const savedUsers = localStorage.getItem('users');
    
    if (!savedUsers) {
      const initialUsers = [...defaultAdmins, defaultCompany];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
    } else {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      
      const updatedUsers = [...parsedUsers];
      let hasChanges = false;
      
      defaultAdmins.forEach(admin => {
        const hasAdmin = parsedUsers.some(u => u.email === admin.email);
        if (!hasAdmin) {
          updatedUsers.push(admin);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
    }
  };

  // ФУНКЦИЯ РЕГИСТРАЦИИ
  const register = (userData) => {
    try {
      // Проверяем, нет ли уже пользователя с таким email
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создаем нового пользователя
      const newUser = {
        id: Date.now(),
        nickname: userData.nickname,
        email: userData.email,
        password: userData.password,
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
        avatar: null,
        phone: '',
        city: ''
      };

      // Обновляем состояние и localStorage
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Автоматически логиним пользователя после регистрации
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      console.log('Пользователь успешно зарегистрирован:', newUser);
      return newUser;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

// В AuthContext.js обновите функцию updateUser
const updateUser = (updatedUserData) => {
  console.log('Обновление пользователя:', updatedUserData);
  
  const updatedUsers = users.map(u => 
    u.id === user.id ? { ...u, ...updatedUserData } : u
  );
  
  setUsers(updatedUsers);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  const updatedUser = { ...user, ...updatedUserData };
  setUser(updatedUser);
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  
  console.log('Пользователь успешно обновлен:', updatedUser);
  return updatedUser;
};

  const login = (email, password) => {
    console.log('Попытка входа:', email);
    
    const foundUser = users.find(u => 
      u.email === email && u.password === password && u.isActive !== false
    );
    
    if (foundUser) {
      console.log('Пользователь найден:', foundUser);
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
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

  // Функции для админ-панели
  const updateUserStatus = (userId, isActive) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isActive } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, isActive };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return updatedUsers.find(u => u.id === userId);
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (user && user.id === userId) {
      logout();
    }
    
    return updatedUsers;
  };

  useEffect(() => {
    initializeDemoData();
    
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Проверяем, существует ли пользователь в системе
        const userExists = users.some(u => u.id === userData.id && u.email === userData.email);
        
        if (userExists) {
          setUser(userData);
        } else {
          // Если пользователь не найден в системе, удаляем из localStorage
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        localStorage.removeItem('currentUser');
      }
    }
    
    setIsInitialized(true); // Помечаем, что инициализация завершена
  }, []);

  const value = {
    user,
    users,
    register,
    login,
    logout,
    updateUser,
    updateUserStatus,
    deleteUser,
    isAuthenticated: !!user,
    isInitialized // Добавляем в контекст
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};