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

  // Функция для обновления данных пользователя (ИСПРАВЛЕННАЯ)
  const updateUser = (updatedUserData) => {
    console.log('Обновление пользователя:', updatedUserData);
    
    // Сохраняем пользователя в состоянии
    setUser(updatedUserData);
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      console.log('Пользователь сохранен в currentUser');
    } catch (error) {
      console.warn('Не удалось сохранить currentUser в localStorage:', error);
      // Если ошибка из-за размера, сохраняем без avatar
      const userWithoutAvatar = { ...updatedUserData, avatar: null };
      localStorage.setItem('currentUser', JSON.stringify(userWithoutAvatar));
    }
    
    // Обновляем в списке пользователей
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u => 
        u.id === updatedUserData.id ? updatedUserData : u
      );
      
      // Сохраняем обновленный список пользователей
      try {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        console.log('Список пользователей обновлен');
      } catch (error) {
        console.warn('Не удалось сохранить users в localStorage:', error);
        // Если ошибка из-за размера, сохраняем без avatar
        const usersWithoutAvatars = updatedUsers.map(u => ({
          ...u,
          avatar: u.avatar && u.avatar.startsWith('data:image') ? null : u.avatar
        }));
        localStorage.setItem('users', JSON.stringify(usersWithoutAvatars));
      }
      
      return updatedUsers;
    });
    
    return updatedUserData;
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
    
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    
    return newUser;
  };

  const login = (email, password) => {
    console.log('Попытка входа:', email);
    console.log('Доступные пользователи:', users);
    
    const foundUser = users.find(u => u.email === email && u.password === password);
    
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

  useEffect(() => {
    // Инициализируем демо-данные
    initializeDemoData();
    
    // Загружаем текущего пользователя
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Пользователь загружен из localStorage:', userData);
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
      }
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