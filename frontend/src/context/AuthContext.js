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

  // Только администраторы по умолчанию
  const defaultAdmins = [
    {
      id: 999,
      nickname: 'Главный Админ',
      email: 'admin@lowlow.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString(),
      avatar: null,
      phone: '',
      city: ''
    },
    {
      id: 998,
      nickname: 'Администратор',
      email: 'admin',
      password: 'admin',
      role: 'admin', 
      isActive: true,
      balance: 0,
      createdAt: new Date().toISOString(),
      avatar: null,
      phone: '',
      city: ''
    }
  ];

  // Пустой массив заказов
  const demoOrders = [];

  // Функция для инициализации данных
  const initializeDemoData = () => {
    const savedUsers = localStorage.getItem('users');
    const savedOrders = localStorage.getItem('orders');
    
    // Инициализация пользователей - ТОЛЬКО АДМИНЫ
    if (!savedUsers) {
      const initialUsers = [...defaultAdmins]; // Только админы, без компаний
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      console.log('Администраторы созданы:', initialUsers);
    } else {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      console.log('Пользователи загружены из localStorage:', parsedUsers);
    }

    // Инициализация заказов
    if (!savedOrders) {
      setOrders(demoOrders);
      localStorage.setItem('orders', JSON.stringify(demoOrders));
    } else {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(parsedOrders);
    }
  };

  // ФУНКЦИЯ РЕГИСТРАЦИИ ОБЫЧНЫХ ПОЛЬЗОВАТЕЛЕЙ
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

  // ФУНКЦИЯ СОЗДАНИЯ БИЗНЕС-ПОЛЬЗОВАТЕЛЯ (для админ-панели)
  const createBusinessUser = (userData) => {
    try {
      // Проверяем, нет ли уже пользователя с таким email
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создаем нового бизнес-пользователя
      const newUser = {
        id: Date.now(),
        nickname: userData.companyName,
        email: userData.email,
        password: userData.password,
        role: 'business',
        companyName: userData.companyName,
        bin: userData.bin || '',
        directorFirstName: userData.directorFirstName || '',
        directorLastName: userData.directorLastName || '',
        phone: userData.phone || '',
        city: userData.city || '',
        openingTime: userData.openingTime || '09:00',
        closingTime: userData.closingTime || '23:00',
        isActive: true,
        balance: 0,
        createdAt: new Date().toISOString(),
        avatar: null
      };

      // Обновляем состояние и localStorage
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      console.log('Бизнес-пользователь успешно создан:', newUser);
      return newUser;
    } catch (error) {
      console.error('Ошибка создания бизнес-пользователя:', error);
      throw error;
    }
  };

  // Функция обновления пользователя - ИСПРАВЛЕННАЯ
  const updateUser = (userId, updatedUserData) => {
    console.log('Обновление пользователя:', userId, updatedUserData);
    
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, ...updatedUserData } : u
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Если обновляем текущего пользователя, обновляем и его состояние
      if (user && user.id === userId) {
        const updatedUser = { ...user, ...updatedUserData };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      console.log('Пользователь успешно обновлен');
      return updatedUsers.find(u => u.id === userId);
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      throw new Error('Произошла ошибка при сохранении данных');
    }
  };

  // Функция загрузки аватара - НОВАЯ ФУНКЦИЯ
  const uploadAvatar = (userId, file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Файл не выбран'));
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Размер файла не должен превышать 5MB'));
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        reject(new Error('Пожалуйста, выберите изображение'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const avatarUrl = e.target.result;
          updateUserAvatar(userId, avatarUrl);
          resolve(avatarUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Функция обновления аватара
  const updateUserAvatar = (userId, avatarUrl) => {
    console.log('Обновление аватара:', userId, avatarUrl);
    
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, avatar: avatarUrl } : u
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Если обновляем текущего пользователя, обновляем и его состояние
      if (user && user.id === userId) {
        const updatedUser = { ...user, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      console.log('Аватар успешно обновлен');
      return updatedUsers.find(u => u.id === userId);
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
      throw new Error('Ошибка при загрузке аватара');
    }
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

  // ФУНКЦИЯ СОЗДАНИЯ ЗАКАЗА
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

  // Получение всех продуктов (для админа)
  const getAllProducts = () => {
    const allProducts = [];
    const businessUsers = users.filter(user => user.role === 'business');
    
    businessUsers.forEach(company => {
      const companyProducts = JSON.parse(localStorage.getItem(`products_${company.id}`)) || [];
      companyProducts.forEach(product => {
        allProducts.push({
          ...product,
          companyName: company.companyName,
          companyId: company.id
        });
      });
    });
    
    return allProducts;
  };

  useEffect(() => {
    initializeDemoData();
    
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Проверяем, существует ли пользователь в системе
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          const allUsers = JSON.parse(savedUsers);
          const userExists = allUsers.some(u => u.id === userData.id && u.email === userData.email);
          
          if (userExists) {
            setUser(userData);
          } else {
            // Если пользователь не найден в системе, удаляем из localStorage
            localStorage.removeItem('currentUser');
          }
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
    updateUserAvatar,
    uploadAvatar, // Новая функция
    updateUserStatus,
    deleteUser,
    createOrder,
    updateOrderStatus,
    getCompanyOrders,
    getUserOrders,
    getAllOrders,
    getAllProducts,
    updateUserBalance,
    createBusinessUser,
    isAuthenticated: !!user,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};