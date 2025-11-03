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
  const [orders, setOrders] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Администраторы по умолчанию
  const defaultAdmins = [
    {
      id: 999,
      nickname: 'Главный Админ',
      email: 'admin@lowlow.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 998,
      nickname: 'Администратор',
      email: 'admin',
      password: 'admin',
      role: 'admin', 
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString()
    }
  ];

  // Демо компании
  const defaultCompanies = [
    {
      id: 1,
      email: 'okadzaki@example.com',
      password: 'okadzaki123',
      role: 'business',
      companyName: 'Okadzaki Sushi',
      bin: '123456789012',
      directorFirstName: 'Айгерім',
      directorLastName: 'Қасенова',
      phone: '+7 (777) 123-45-67',
      city: 'Астана',
      openingTime: '09:00',
      closingTime: '23:00',
      avatar: null,
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'sf@example.com',
      password: 'sf123456',
      role: 'business',
      companyName: 'SF Abaya',
      bin: '120000000876',
      directorFirstName: 'Жанбол',
      directorLastName: 'Ержанулу',
      phone: '+7 (700) 123-90-67',
      city: 'Астана',
      openingTime: '09:00',
      closingTime: '23:00',
      avatar: null,
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString()
    }
  ];

  // УБИРАЕМ ДЕМО ЗАКАЗЫ - оставляем пустой массив
  const demoOrders = [];

  // Функция для инициализации данных
  const initializeDemoData = () => {
    const savedUsers = localStorage.getItem('users');
    const savedOrders = localStorage.getItem('orders');
    
    // Инициализация пользователей
    if (!savedUsers) {
      const initialUsers = [...defaultAdmins, ...defaultCompanies];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      console.log('Демо пользователи созданы:', initialUsers);
    } else {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      console.log('Пользователи загружены из localStorage:', parsedUsers);
    }

    // Инициализация заказов - ТОЛЬКО ЕСЛИ НЕТ СОХРАНЕННЫХ
    if (!savedOrders) {
      setOrders(demoOrders);
      localStorage.setItem('orders', JSON.stringify(demoOrders));
    } else {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(parsedOrders);
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
        balance: 5000, // Каждому новому пользователю 5000 тенге
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

  // Функция обновления пользователя
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

  // Функция входа
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

  // ФУНКЦИЯ СОЗДАНИЯ ЗАКАЗА (ИСПРАВЛЕННАЯ)
  const createOrder = (orderData) => {
    try {
      console.log('Создание заказа:', orderData);
      
      // Проверяем существование пользователя
      const currentUser = users.find(u => u.id === orderData.userId);
      if (!currentUser) {
        throw new Error('Пользователь не найден');
      }
      
      // Проверяем карту пользователя
      const userCards = JSON.parse(localStorage.getItem(`userCards_${orderData.userId}`)) || [];
      const defaultCard = userCards.find(card => card.isDefault);
      
      if (!defaultCard) {
        throw new Error('Карта для оплаты не найдена');
      }
      
      // Проверяем баланс карты
      if (defaultCard.balance < orderData.total) {
        throw new Error('Недостаточно средств');
      }
      
      // Снимаем деньги с баланса карты
      const updatedCards = userCards.map(card => 
        card.id === defaultCard.id 
          ? { ...card, balance: Math.max(0, card.balance - orderData.total) }
          : card
      );
      localStorage.setItem(`userCards_${orderData.userId}`, JSON.stringify(updatedCards));
      
      // Обновляем баланс пользователя в системе
      updateUserBalance(orderData.userId, orderData.total, 'decrease');
      
      // Создаем заказ с коротким ID
      const orderId = Date.now();
      const shortOrderId = parseInt(orderId.toString().slice(-6));
      
      const newOrder = {
        id: shortOrderId,
        ...orderData,
        cardLast4: defaultCard.last4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Сохраняем заказ в общем хранилище
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Сохраняем заказ для компании
      const companyOrders = JSON.parse(localStorage.getItem(`companyOrders_${orderData.companyId}`)) || [];
      localStorage.setItem(`companyOrders_${orderData.companyId}`, JSON.stringify([...companyOrders, newOrder]));

      console.log('Заказ успешно создан:', newOrder);
      
      // Обновляем количество продуктов
      if (orderData.items && orderData.companyId) {
        updateProductQuantities(orderData.companyId, orderData.items);
      }
      
      return newOrder;
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      throw error;
    }
  };

  // Функция обновления количества продуктов
  const updateProductQuantities = (companyId, orderedItems) => {
    try {
      const companyProducts = JSON.parse(localStorage.getItem(`products_${companyId}`)) || [];
      const updatedProducts = companyProducts.map(product => {
        const orderedItem = orderedItems.find(item => item.id === product.id);
        if (orderedItem && product.quantity !== undefined) {
          const newQuantity = product.quantity - orderedItem.quantity;
          return {
            ...product,
            quantity: Math.max(0, newQuantity),
            status: newQuantity <= 0 ? 'inactive' : product.status
          };
        }
        return product;
      });
      
      localStorage.setItem(`products_${companyId}`, JSON.stringify(updatedProducts));
      console.log('Количества продуктов обновлены');
    } catch (error) {
      console.error('Ошибка обновления количеств продуктов:', error);
    }
  };

  // Функция для обновления статуса заказа (для компаний)
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Обновляем также в хранилище компании
    const orderToUpdate = updatedOrders.find(order => order.id === orderId);
    if (orderToUpdate) {
      const companyOrders = JSON.parse(localStorage.getItem(`companyOrders_${orderToUpdate.companyId}`)) || [];
      const updatedCompanyOrders = companyOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem(`companyOrders_${orderToUpdate.companyId}`, JSON.stringify(updatedCompanyOrders));
    }
    
    const updatedOrder = updatedOrders.find(order => order.id === orderId);
    console.log(`Статус заказа #${orderId} изменен на: ${newStatus}`);
    return updatedOrder;
  };

  // Функция для получения заказов компании
  const getCompanyOrders = (companyId) => {
    const companyOrders = JSON.parse(localStorage.getItem(`companyOrders_${companyId}`)) || [];
    return companyOrders;
  };

  // Функция для получения заказов пользователя
  const getUserOrders = (userId) => {
    return orders.filter(order => order.userId === userId);
  };

  // Функция для обновления баланса
  const updateUserBalance = (userId, amount, type = 'decrease') => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newBalance = type === 'decrease' 
          ? u.balance - amount 
          : u.balance + amount;
        
        return { 
          ...u, 
          balance: Math.max(0, newBalance) // Баланс не может быть отрицательным
        };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Обновляем текущего пользователя если нужно
    if (user && user.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return updatedUsers.find(u => u.id === userId);
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

  // Получение всех заказов (для админа)
  const getAllOrders = () => {
    return orders;
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
    
    setIsInitialized(true);
  }, []);

  const value = {
    user,
    users,
    orders,
    register,
    login,
    logout,
    updateUser,
    updateUserStatus,
    deleteUser,
    createOrder,
    updateOrderStatus,
    getCompanyOrders,
    getUserOrders,
    getAllOrders,
    updateUserBalance,
    isAuthenticated: !!user,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};