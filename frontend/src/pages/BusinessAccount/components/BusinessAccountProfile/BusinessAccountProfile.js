import React, { useRef, useState } from 'react';
import './BusinessAccountProfile.css';

const BusinessAccountProfile = ({ 
  user, 
  companyData, 
  isEditing, 
  setIsEditing, 
  onInputChange, 
  onAvatarClick, 
  onFileChange, 
  onSave, 
  onCancel,
  fileInputRef 
}) => {
  const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Тараз', 'Павлодар', 'Усть-Каменогорск', 'Семей'];
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (type, value) => {
    onInputChange({
      target: {
        name: type === 'open' ? 'openingTime' : 'closingTime',
        value: value
      }
    });
  };

  const TimePicker = ({ type, value, onChange }) => (
    <div className="time-picker">
      <select 
        value={value || '09:00'} 
        onChange={(e) => onChange(type, e.target.value)}
        className="time-select"
        disabled={!isEditing}
      >
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return [
            `${hour}:00`,
            `${hour}:30`
          ];
        }).flat().map(time => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="business-account-section">
      <div className="section-header">
        <h2 className="section-title">Бизнес-профиль</h2>
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
          onClick={onAvatarClick}
        >
          <div className="business-avatar-upload">
            {user?.avatar ? (
              <img src={user.avatar} alt="Business Logo" />
            ) : (
              <div className="business-avatar-placeholder">
                {companyData?.companyName ? companyData.companyName.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="avatar-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 21.4142C3.21071 21.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 5L19 8M20.5 3.5C20.8978 3.10217 21.4374 2.87868 22 2.87868C22.5626 2.87868 23.1022 3.10217 23.5 3.5C23.8978 3.89782 24.1213 4.43739 24.1213 5C24.1213 5.56261 23.8978 6.10217 23.5 6.5L14 16L10 17L11 13L20.5 3.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Сменить логотип</span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {isEditing && (
          <p className="avatar-hint">Нажмите на логотип для загрузки изображения компании</p>
        )}
      </div>
      
      <div className="form-grid">
        {/* Важные поля - первый ряд */}
        <div className="form-group">
          <label className="form-label">Название компании *</label>
          <input
            type="text"
            name="companyName"
            value={companyData.companyName}
            onChange={onInputChange}
            className="form-input"
            placeholder="Введите название компании"
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">БИН компании *</label>
          <input
            type="text"
            name="bin"
            value={companyData.bin}
            onChange={onInputChange}
            className="form-input"
            placeholder="Введите БИН компании"
            disabled={!isEditing}
          />
        </div>
        
        {/* Второй ряд */}
        <div className="form-group">
          <label className="form-label">Имя руководителя *</label>
          <input
            type="text"
            name="directorFirstName"
            value={companyData.directorFirstName}
            onChange={onInputChange}
            className="form-input"
            placeholder="Введите имя руководителя"
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Фамилия руководителя</label>
          <input
            type="text"
            name="directorLastName"
            value={companyData.directorLastName}
            onChange={onInputChange}
            className="form-input"
            placeholder="Введите фамилию руководителя"
            disabled={!isEditing}
          />
        </div>
        
        {/* Третий ряд */}
        <div className="form-group">
          <label className="form-label">Email компании *</label>
          <input
            type="email"
            name="email"
            value={companyData.email}
            onChange={onInputChange}
            className="form-input"
            placeholder="Введите email компании"
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Телефон компании *</label>
          <input
            type="tel"
            name="phone"
            value={companyData.phone}
            onChange={onInputChange}
            className="form-input"
            placeholder="+7 (XXX) XXX-XX-XX"
            disabled={!isEditing}
            pattern="[+]?[0-9\s\-\(\)]+"
            inputMode="tel"
          />
        </div>
        
        {/* Четвертый ряд - Город и Часы работы */}
        <div className="form-group">
          <label className="form-label">Город *</label>
          <select
            name="city"
            value={companyData.city}
            onChange={onInputChange}
            className="form-input select-input"
            disabled={!isEditing}
          >
            <option value="">Выберите город</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Часы работы *</label>
          <div className="working-hours-container">
            <div className="time-input-group">
              <span className="time-label">с</span>
              <TimePicker 
                type="open" 
                value={companyData.openingTime} 
                onChange={handleTimeChange}
              />
            </div>
            <div className="time-separator">-</div>
            <div className="time-input-group">
              <span className="time-label">до</span>
              <TimePicker 
                type="close" 
                value={companyData.closingTime} 
                onChange={handleTimeChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="save-button-container">
          <button className="save-btn" onClick={onSave}>
            Сохранить изменения
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessAccountProfile;