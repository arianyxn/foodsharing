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
    }
  }, [user]);

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