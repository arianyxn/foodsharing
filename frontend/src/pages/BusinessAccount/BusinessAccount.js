import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './BusinessAccount.css';

// Импортируем компоненты
import BusinessAccountSidebar from './components/BusinessAccountSidebar/BusinessAccountSidebar';
import BusinessAccountProfile from './components/BusinessAccountProfile/BusinessAccountProfile';
import BusinessAccountProducts from './components/BusinessAccountProducts/BusinessAccountProducts';
import BusinessAccountOrdersHistory from './components/BusinessAccountOrdersHistory/BusinessAccountOrdersHistory';
import BusinessAccountLocation from './components/BusinessAccountLocation/BusinessAccountLocation';
import BusinessAccountDialogs from './components/BusinessAccountDialogs/BusinessAccountDialogs';

const BusinessAccount = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Состояния
  const [activeSection, setActiveSection] = useState('profile');
  const [showNotification, setShowNotification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Данные компании
  const [companyData, setCompanyData] = useState({
    directorFirstName: '',
    directorLastName: '',
    phone: '',
    city: '',
    email: '',
    bin: '',
    companyName: '',
    avatar: '', // ДОБАВЛЕНО поле для аватара
    openingTime: '09:00',
    closingTime: '18:00'
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    if (user) {
      setCompanyData(prev => ({
        ...prev,
        email: user.email || '',
        directorFirstName: user.directorFirstName || '',
        directorLastName: user.directorLastName || '',
        phone: user.phone || '',
        city: user.city || '',
        bin: user.bin || '',
        companyName: user.companyName || '',
        avatar: user.avatar || '', // ДОБАВЛЕНО загрузка аватара
        openingTime: user.openingTime || '09:00',
        closingTime: user.closingTime || '18:00'
      }));
      
      const hasBasicInfo = user.directorFirstName && user.email && user.bin && user.companyName;
      if (!hasBasicInfo) {
        setShowNotification(true);
      }
    }
  }, [user]);

  // Обработчики для профиля компании
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
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
          
          // Сохраняем аватар в companyData
          setCompanyData(prev => ({
            ...prev,
            avatar: compressedAvatarUrl
          }));

          console.log('Аватар загружен и сжат:', compressedAvatarUrl.substring(0, 100) + '...');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Сохранение данных компании:', companyData);
    
    // Валидация обязательных полей
    if (!companyData.companyName || !companyData.bin || !companyData.directorFirstName || 
        !companyData.email || !companyData.phone || !companyData.city) {
      alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
      return;
    }

    const updatedUser = {
      ...user,
      ...companyData
    };
    
    console.log('Обновленный пользователь для сохранения:', updatedUser);
    
    updateUser(updatedUser);
    setShowNotification(false);
    setIsEditing(false);
    
    alert('Данные успешно сохранены!');
  };

  const handleCancel = () => {
    if (user) {
      setCompanyData({
        directorFirstName: user.directorFirstName || '',
        directorLastName: user.directorLastName || '',
        phone: user.phone || '',
        city: user.city || '',
        email: user.email || '',
        bin: user.bin || '',
        companyName: user.companyName || '',
        avatar: user.avatar || '', // ДОБАВЛЕНО восстановление аватара
        openingTime: user.openingTime || '09:00',
        closingTime: user.closingTime || '18:00'
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
    console.log('Удаление бизнес-аккаунта');
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
      case 'profile':
        return (
          <BusinessAccountProfile
            user={user}
            companyData={companyData}
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
      
      case 'products':
        return <BusinessAccountProducts user={user} />;
      
      case 'orders':
        return <BusinessAccountOrdersHistory user={user} />;
      
      case 'location':
        return <BusinessAccountLocation />;
      
      case 'delete':
        return (
          <div className="business-account-section">
            <h2 className="section-title">Удаление бизнес-аккаунта</h2>
            <div className="delete-warning">
              <p className="warning-text">
                Внимание: Удаление бизнес-аккаунта приведет к полной потере всех данных компании, 
                включая историю заказов, продукты и персональные настройки. Это действие нельзя отменить.
              </p>
              <button className="delete-account-btn" onClick={handleDeleteAccountClick}>
                Удалить бизнес-аккаунт
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <BusinessAccountProfile
            user={user}
            companyData={companyData}
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
    <div className="business-account-page">
      {/* Уведомление */}
      {showNotification && (
        <div className="notification">
          <div className="notification-content">
            <p>Пожалуйста, заполните информацию о вашей компании для полного доступа ко всем функциям бизнес-аккаунта</p>
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
      <div className="business-account-container">
        <BusinessAccountSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          onLogout={handleLogoutClick}
          onDeleteAccount={handleDeleteAccountClick}
        />
        
        <div className="business-account-content">
          {renderActiveSection()}
        </div>
      </div>

      {/* Диалоговые окна */}
      <BusinessAccountDialogs
        showLogoutDialog={showLogoutDialog}
        showDeleteDialog={showDeleteDialog}
        onLogoutConfirm={handleLogoutConfirm}
        onDeleteConfirm={handleDeleteConfirm}
        onCancelDialog={handleCancelDialog}
      />
    </div>
  );
};

export default BusinessAccount;