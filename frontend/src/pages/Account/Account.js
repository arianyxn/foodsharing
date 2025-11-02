import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Account.css';

// Импортируем компоненты
import AccountSidebar from './components/AccountSidebar/AccountSidebar';
import AccountProfile from './components/AccountProfile/AccountProfile';
import AccountCards from './components/AccountCards/AccountCards';
import AccountLocation from './components/AccountLocation/AccountLocation';
import AccountOrders from './components/AccountOrders/AccountOrders';
import AccountDialogs from './components/AccountDialogs/AccountDialogs';

const Account = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Состояния
  const [activeSection, setActiveSection] = useState('account');
  const [showNotification, setShowNotification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Данные пользователя
  const [userData, setUserData] = useState({
    firstName: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  // Данные карт
  const [userCards, setUserCards] = useState([]);
  const [cardData, setCardData] = useState({
    number: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });
  const [cardErrors, setCardErrors] = useState({});
  const [editingCardId, setEditingCardId] = useState(null);

  const cities = ['Алматы', 'Астана', 'Шымкент'];

  // Загрузка данных при монтировании
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || user.nickname || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || ''
      }));
      
      const hasBasicInfo = (user.firstName || user.nickname) && user.email;
      if (!hasBasicInfo) {
        setShowNotification(true);
      }

      loadUserCards();
    }
  }, [user]);

  // Сортировка карт - активная всегда первая
  useEffect(() => {
    if (userCards.length > 0) {
      const sortedCards = [...userCards].sort((a, b) => 
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      if (JSON.stringify(sortedCards) !== JSON.stringify(userCards)) {
        setUserCards(sortedCards);
      }
    }
  }, [userCards]);

  // Функции для работы с картами
  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^2/.test(cleanNumber)) return 'mir';
    return '';
  };

  const formatCardNumber = (number) => {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanNumber)) return 'Только цифры';
    if (cleanNumber.length !== 16) return 'Должно быть 16 цифр';
    return '';
  };

  const validateExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Формат: ММ/ГГ';
    const [month, year] = expiry.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) return 'Неверный месяц';
    
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Карта просрочена';
    }
    
    return '';
  };

  const validateCVV = (cvv) => {
    if (!/^\d+$/.test(cvv)) return 'Только цифры';
    if (cvv.length !== 3) return 'Должно быть 3 цифры';
    return '';
  };

  // Загрузка карт пользователя
  const loadUserCards = () => {
    if (user) {
      const savedCards = JSON.parse(localStorage.getItem(`userCards_${user.id}`)) || [];
      const sortedCards = savedCards.sort((a, b) => 
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      setUserCards(sortedCards);
    }
  };

  // Обработчики для профиля
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          
          let { width, height } = img;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedAvatarUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          const updatedUser = {
            ...user,
            avatar: compressedAvatarUrl
          };
          
          updateUser(updatedUser);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: userData.firstName,
      email: userData.email,
      phone: userData.phone,
      city: userData.city,
      address: userData.address
    };
    
    updateUser(updatedUser);
    setShowNotification(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setUserData({
        firstName: user.firstName || user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  // Обработчики для карт
  const handleAddCard = () => {
    setEditingCardId(null);
    setCardData({
      number: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      isDefault: userCards.length === 0
    });
    setActiveSection('add-card');
  };

  const handleEditCard = (cardId) => {
    const cardToEdit = userCards.find(card => card.id === cardId);
    if (cardToEdit) {
      setCardData({
        number: formatCardNumber(cardToEdit.number),
        cardHolder: cardToEdit.cardHolder,
        expiry: cardToEdit.expiry,
        cvv: '', // CVV не хранится для безопасности
        isDefault: cardToEdit.isDefault
      });
      setEditingCardId(cardId);
      setActiveSection('add-card');
    }
  };

  const handleSetDefaultCard = (cardId) => {
    const updatedCards = userCards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    
    const sortedCards = updatedCards.sort((a, b) => 
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    
    setUserCards(sortedCards);
    localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
  };

  const handleDeleteCard = (cardId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
      const cardToDelete = userCards.find(card => card.id === cardId);
      const updatedCards = userCards.filter(card => card.id !== cardId);
      
      if (updatedCards.length > 0 && cardToDelete?.isDefault) {
        updatedCards[0].isDefault = true;
      }
      
      const sortedCards = updatedCards.sort((a, b) => 
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      
      setUserCards(sortedCards);
      localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
    }
  };

  // Обработчики для диалогов
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    setShowLogoutDialog(false);
  };

  const handleDeleteConfirm = () => {
    console.log('Удаление аккаунта');
    logout();
    navigate('/');
    setShowDeleteDialog(false);
  };

  const handleCancelDialog = () => {
    setShowLogoutDialog(false);
    setShowDeleteDialog(false);
  };

  // Рендер активной секции
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <AccountProfile
            user={user}
            userData={userData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onInputChange={handleInputChange}
            onAvatarClick={handleAvatarClick}
            onFileChange={handleFileChange}
            onSave={handleSave}
            onCancel={handleCancel}
            fileInputRef={fileInputRef}
          />
        );
      
      case 'cards':
  return <AccountCards user={user} />;
      
      case 'location':
        return <AccountLocation />;
      
      case 'orders':
        return <AccountOrders />;
      
      case 'delete':
        return (
          <div className="account-section">
            <h2 className="section-title">Удаление аккаунта</h2>
            <div className="delete-warning">
              <p className="warning-text">
                Внимание: Удаление аккаунта приведет к полной потере всех ваших данных, 
                включая историю заказов и персональные настройки. Это действие нельзя отменить.
              </p>
              <button className="delete-account-btn" onClick={handleDeleteAccountClick}>
                Удалить аккаунт
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <AccountProfile
            user={user}
            userData={userData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onInputChange={handleInputChange}
            onAvatarClick={handleAvatarClick}
            onFileChange={handleFileChange}
            onSave={handleSave}
            onCancel={handleCancel}
            fileInputRef={fileInputRef}
          />
        );
    }
  };

  return (
    <div className="account-page">
      {/* Уведомление */}
      {showNotification && (
        <div className="notification">
          <div className="notification-content">
            <p>Пожалуйста, заполните информацию в вашем профиле для полного доступа ко всем функциям</p>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Основной контент */}
      <div className="account-container">
        <AccountSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          onLogout={handleLogoutClick}
          onDeleteAccount={handleDeleteAccountClick}
        />
        
        <div className="account-content">
          {renderActiveSection()}
        </div>
      </div>

      {/* Диалоговые окна */}
      <AccountDialogs
        showLogoutDialog={showLogoutDialog}
        showDeleteDialog={showDeleteDialog}
        onLogoutConfirm={handleLogoutConfirm}
        onDeleteConfirm={handleDeleteConfirm}
        onCancelDialog={handleCancelDialog}
      />
    </div>
  );
};

export default Account;