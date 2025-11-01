import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('account');
  const [showNotification, setShowNotification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  const cities = ['Алматы', 'Астана', 'Шымкент'];

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
        // Создаем canvas для сжатия изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Максимальные размеры
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        
        let { width, height } = img;
        
        // Изменяем размер если нужно
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
        
        // Рисуем сжатое изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Получаем base64 сжатого изображения
        const compressedAvatarUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Обновляем аватар в контексте
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

  const handleEditClick = () => {
    setIsEditing(true);
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
    
    console.log('Сохранение данных:', userData);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      console.log('Удаление аккаунта');
      logout();
      navigate('/');
    }
  };

  const renderAccountSection = () => (
    <div className="account-section">
      <div className="section-header">
        <h2 className="section-title">Аккаунт</h2>
        {!isEditing && (
          <button className="edit-button" onClick={handleEditClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {/* Аватар с возможностью загрузки */}
      <div className="avatar-upload-section">
        <div 
          className={`avatar-upload-container ${isEditing ? 'editable' : ''}`}
          onClick={handleAvatarClick}
        >
          <div className="user-avatar-upload">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder-upload">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 
                 user?.nickname ? user.nickname.charAt(0).toUpperCase() : 
                 user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="avatar-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 5L19 8M20.5 3.5C20.8978 3.10217 21.4374 2.87868 22 2.87868C22.5626 2.87868 23.1022 3.10217 23.5 3.5C23.8978 3.89782 24.1213 4.43739 24.1213 5C24.1213 5.56261 23.8978 6.10217 23.5 6.5L14 16L10 17L11 13L20.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Сменить фото</span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {isEditing && (
          <p className="avatar-hint">Нажмите на аватар для загрузки фото</p>
        )}
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Имя *</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Введите ваше имя"
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Введите ваш email"
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Телефон</label>
          <input
            type="tel"
            name="phone"
            value={userData.phone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="+7 (XXX) XXX-XX-XX"
            disabled={!isEditing}
            pattern="[+]?[0-9\s\-\(\)]+"
            inputMode="tel"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Город *</label>
          <select
            name="city"
            value={userData.city}
            onChange={handleInputChange}
            className="form-input select-input"
            disabled={!isEditing}
          >
            <option value="">Выберите город</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group full-width">
          <label className="form-label">Адрес *</label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Введите ваш адрес"
            disabled={!isEditing}
          />
        </div>
      </div>
      
      {isEditing && (
        <div className="save-button-container">
          <button className="save-btn" onClick={handleSave}>
            Сохранить изменения
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Отмена
          </button>
        </div>
      )}
    </div>
  );

  // ... остальные render функции без изменений ...

// ... остальной код без изменений ...

  const renderLocationSection = () => (
    <div className="account-section">
      <h2 className="section-title">Мое местоположение</h2>
      <div className="map-placeholder">
        <p>Здесь будет карта с вашим местоположением</p>
      </div>
    </div>
  );

  const renderOrdersSection = () => (
    <div className="account-section">
      <h2 className="section-title">Мои заказы</h2>
      <div className="orders-list">
        <p>У вас пока нет заказов</p>
      </div>
    </div>
  );

  const renderCardsSection = () => (
    <div className="account-section">
      <h2 className="section-title">Мои карты</h2>
      <div className="cards-list">
        <p>У вас пока нет сохраненных карт</p>
      </div>
    </div>
  );

  const renderDeleteSection = () => (
    <div className="account-section">
      <h2 className="section-title">Удаление аккаунта</h2>
      <div className="delete-warning">
        <p className="warning-text">
          Внимание: Удаление аккаунта приведет к полной потере всех ваших данных, 
          включая историю заказов и персональные настройки. Это действие нельзя отменить.
        </p>
        <button className="delete-account-btn" onClick={handleDeleteAccount}>
          Удалить аккаунт
        </button>
      </div>
    </div>
  );

  return (
    <div className="account-page">
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
      
      <div className="account-container">
        <div className="account-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar-large">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder-large">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 
                   user?.nickname ? user.nickname.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="user-info-sidebar">
              <h3 className="user-name">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() :
                 user?.nickname || user?.email || 'Пользователь'}
              </h3>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          
          <nav className="account-nav">
            <button 
              className={`nav-item ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              Аккаунт
            </button>
            <button 
              className={`nav-item ${activeSection === 'location' ? 'active' : ''}`}
              onClick={() => setActiveSection('location')}
            >
              Мое местоположение
            </button>
            <button 
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              Мои заказы
            </button>
            <button 
              className={`nav-item ${activeSection === 'cards' ? 'active' : ''}`}
              onClick={() => setActiveSection('cards')}
            >
              Мои карты
            </button>
            
            {/* Выйти из аккаунта - над удалением */}
            <button 
              className="nav-item logout"
              onClick={handleLogout}
            >
              Выйти из аккаунта
            </button>
            
            <button 
              className={`nav-item delete ${activeSection === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveSection('delete')}
            >
              Удалить аккаунт
            </button>
          </nav>
        </div>
        
        <div className="account-content">
          {activeSection === 'account' && renderAccountSection()}
          {activeSection === 'location' && renderLocationSection()}
          {activeSection === 'orders' && renderOrdersSection()}
          {activeSection === 'cards' && renderCardsSection()}
          {activeSection === 'delete' && renderDeleteSection()}
        </div>
      </div>
    </div>
  );
};

export default Account;