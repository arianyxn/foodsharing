// src/pages/Account/components/AccountProfile/AccountProfile.js
import React, { useRef, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './AccountProfile.css';

const AccountProfile = () => {
  const { user, updateUser, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    avatar: user?.avatar || null
  });
  const fileInputRef = useRef(null);

  const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей'];

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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await uploadAvatar(user.id, file);
      
      // Обновляем локальное состояние
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
      
      alert('Аватар успешно обновлен!');
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      alert(error.message || 'Ошибка при загрузке аватара');
    }
  };

  const handleSave = async () => {
    try {
      // Проверяем обязательные поля
      if (!userData.firstName || !userData.email || !userData.city) {
        alert('Пожалуйста, заполните все обязательные поля (отмечены *)');
        return;
      }

      // Подготавливаем данные для обновления
      const updateData = {
        nickname: userData.firstName,
        email: userData.email,
        phone: userData.phone,
        city: userData.city
      };

      // Обновляем пользователя
      await updateUser(user.id, updateData);
      
      // Показываем сообщение об успехе
      alert('Данные успешно сохранены!');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert(error.message || 'Произошла ошибка при сохранении данных');
    }
  };

  const handleCancel = () => {
    // Восстанавливаем исходные данные
    setUserData({
      firstName: user?.nickname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      avatar: user?.avatar || null
    });
    setIsEditing(false);
  };

  return (
    <div className="account-section">
      <div className="section-header">
        <h2 className="section-title">Аккаунт</h2>
        {!isEditing && (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="avatar-upload-section">
        <div 
          className={`avatar-upload-container ${isEditing ? 'editable' : ''}`}
          onClick={handleAvatarClick}
        >
          <div className="user-avatar-upload">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder-upload">
                {userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 
                 user?.nickname ? user.nickname.charAt(0).toUpperCase() : 
                 user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="avatar-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 21.4142C3.21071 21.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 5L19 8M20.5 3.5C20.8978 3.10217 21.4374 2.87868 22 2.87868C22.5626 2.87868 23.1022 3.10217 23.5 3.5C23.8978 3.89782 24.1213 4.43739 24.1213 5C24.1213 5.56261 23.8978 6.10217 23.5 6.5L12 15L10 17L11 13L20.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
};

export default AccountProfile;