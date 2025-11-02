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

      // Загрузка карт пользователя
      loadUserCards();
    }
  }, [user]);

  // Автоматическая сортировка карт - активная всегда первая
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

  // Функция загрузки карт
  const loadUserCards = () => {
    if (user) {
      const savedCards = JSON.parse(localStorage.getItem(`userCards_${user.id}`)) || [];
      console.log('Загружены карты:', savedCards);
      // Сортируем при загрузке - активная карта первая
      const sortedCards = savedCards.sort((a, b) => 
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      setUserCards(sortedCards);
    }
  };

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

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }
    
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    if (name === 'cardHolder') {
      formattedValue = value.toUpperCase();
    }
    
    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Валидация в реальном времени
    if (name === 'number' && value) {
      setCardErrors(prev => ({ ...prev, number: validateCardNumber(value) }));
    }
    if (name === 'expiry' && value) {
      setCardErrors(prev => ({ ...prev, expiry: validateExpiry(value) }));
    }
    if (name === 'cvv' && value) {
      setCardErrors(prev => ({ ...prev, cvv: validateCVV(value) }));
    }
  };

  const isCardFormValid = () => {
    if (editingCardId) {
      // При редактировании CVV не обязателен
      return cardData.number && 
             cardData.cardHolder && 
             cardData.expiry &&
             !cardErrors.number &&
             !cardErrors.expiry &&
             (!cardData.cvv || !cardErrors.cvv);
    } else {
      // При добавлении новой карты все поля обязательны
      return cardData.number && 
             cardData.cardHolder && 
             cardData.expiry && 
             cardData.cvv &&
             !cardErrors.number &&
             !cardErrors.expiry &&
             !cardErrors.cvv;
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    
    const errors = {
      number: validateCardNumber(cardData.number),
      cardHolder: cardData.cardHolder ? '' : 'Введите имя владельца',
      expiry: validateExpiry(cardData.expiry),
      cvv: validateCVV(cardData.cvv)
    };
    
    setCardErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    const newCard = {
      id: Date.now(),
      number: cardData.number.replace(/\s/g, ''),
      last4: cardData.number.slice(-4),
      cardHolder: cardData.cardHolder,
      expiry: cardData.expiry,
      type: detectCardType(cardData.number),
      isDefault: cardData.isDefault || userCards.length === 0
    };
    
    let updatedCards;
    if (cardData.isDefault) {
      updatedCards = userCards.map(card => ({ ...card, isDefault: false }));
      updatedCards.push(newCard);
    } else {
      updatedCards = [...userCards, newCard];
    }
    
    // Сортируем - активная карта всегда первая
    const sortedCards = updatedCards.sort((a, b) => 
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    
    setUserCards(sortedCards);
    localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
    
    // Сброс формы
    setCardData({
      number: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      isDefault: false
    });
    
    setActiveSection('cards');
    console.log('Карта добавлена:', newCard);
  };

  const handleEditCard = (cardId) => {
    console.log('Редактирование карты:', cardId);
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

  const handleUpdateCard = (e) => {
    e.preventDefault();
    
    const errors = {
      number: validateCardNumber(cardData.number),
      cardHolder: cardData.cardHolder ? '' : 'Введите имя владельца',
      expiry: validateExpiry(cardData.expiry),
      cvv: cardData.cvv ? validateCVV(cardData.cvv) : '' // CVV не обязателен при редактировании
    };
    
    setCardErrors(errors);
    
    if (Object.values(errors).some(error => error && error !== '')) {
      return;
    }
    
    const updatedCards = userCards.map(card => {
      if (card.id === editingCardId) {
        const updatedCard = {
          ...card,
          number: cardData.number.replace(/\s/g, ''),
          last4: cardData.number.slice(-4),
          cardHolder: cardData.cardHolder,
          expiry: cardData.expiry,
          type: detectCardType(cardData.number),
          isDefault: cardData.isDefault
        };
        
        return updatedCard;
      }
      // Если устанавливаем новую карту по умолчанию, снимаем флаг с других
      return cardData.isDefault ? { ...card, isDefault: false } : card;
    });
    
    // Сортируем - активная карта всегда первая
    const sortedCards = updatedCards.sort((a, b) => 
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    
    setUserCards(sortedCards);
    localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
    
    // Сброс формы
    setCardData({
      number: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      isDefault: false
    });
    setEditingCardId(null);
    setActiveSection('cards');
    console.log('Карта обновлена');
  };

  const handleSetDefaultCard = (cardId) => {
    console.log('Установка основной карты:', cardId);
    const updatedCards = userCards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    
    // Сортируем - активная карта всегда первая
    const sortedCards = updatedCards.sort((a, b) => 
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
    
    setUserCards(sortedCards);
    localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
    console.log('Основная карта изменена');
  };

  const handleDeleteCard = (cardId) => {
    console.log('Удаление карты:', cardId);
    if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
      const cardToDelete = userCards.find(card => card.id === cardId);
      const updatedCards = userCards.filter(card => card.id !== cardId);
      
      // Если удалили карту по умолчанию, сделать первую карту основной
      if (updatedCards.length > 0 && cardToDelete?.isDefault) {
        updatedCards[0].isDefault = true;
      }
      
      // Сортируем - активная карта всегда первая
      const sortedCards = updatedCards.sort((a, b) => 
        a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
      );
      
      setUserCards(sortedCards);
      localStorage.setItem(`userCards_${user.id}`, JSON.stringify(sortedCards));
      console.log('Карта удалена');
    }
  };

  const handleCancelCardEdit = () => {
    setCardData({
      number: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      isDefault: false
    });
    setEditingCardId(null);
    setActiveSection('cards');
  };

  // Остальные функции
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
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 21.4142C3.21071 21.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  const renderCardsSection = () => (
    <div className="account-section">
      <div className="section-header">
        <h2 className="section-title">Мои карты</h2>
        {userCards.length < 3 && (
          <button 
            className="add-card-btn"
            onClick={() => {
              setEditingCardId(null);
              setCardData({
                number: '',
                cardHolder: '',
                expiry: '',
                cvv: '',
                isDefault: userCards.length === 0
              });
              setActiveSection('add-card');
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Добавить карту
          </button>
        )}
      </div>
      
      {userCards.length === 0 ? (
        <div className="empty-cards">
          <div className="empty-cards-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="18" cy="15" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h3>У вас пока нет сохраненных карт</h3>
          <p>Добавьте карту для быстрой оплаты заказов</p>
          <button 
            className="add-first-card-btn"
            onClick={() => {
              setEditingCardId(null);
              setCardData({
                number: '',
                cardHolder: '',
                expiry: '',
                cvv: '',
                isDefault: true
              });
              setActiveSection('add-card');
            }}
          >
            Добавить первую карту
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {userCards.map((card) => (
            <div 
              key={card.id} 
              className={`card-item ${card.isDefault ? 'active-card' : 'inactive-card'}`}
            >
              <div className="card-header">
                <div className="card-type">
                  {card.type === 'visa' && (
                    <span className="card-type-badge visa">VISA</span>
                  )}
                  {card.type === 'mastercard' && (
                    <span className="card-type-badge mastercard">MasterCard</span>
                  )}
                  {card.type === 'mir' && (
                    <span className="card-type-badge mir">MIR</span>
                  )}
                </div>
                {card.isDefault && (
                  <span className="default-badge">Основная</span>
                )}
              </div>
              
              <div className="card-number">
                •••• •••• •••• {card.last4}
              </div>
              
              <div className="card-footer">
                <div className="card-info">
                  <div className="card-holder">{card.cardHolder}</div>
                  <div className="card-expiry">{card.expiry}</div>
                </div>
                <div className="card-actions">
                  <button 
                    className="card-action-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCard(card.id);
                    }}
                    title="Редактировать карту"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {!card.isDefault && (
                    <button 
                      className="card-action-btn set-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefaultCard(card.id);
                      }}
                      title="Сделать основной"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <button 
                    className="card-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCard(card.id);
                    }}
                    title="Удалить карту"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {userCards.length < 3 && (
            <div className="add-card-placeholder" onClick={() => {
              setEditingCardId(null);
              setCardData({
                number: '',
                cardHolder: '',
                expiry: '',
                cvv: '',
                isDefault: false
              });
              setActiveSection('add-card');
            }}>
              <div className="add-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span>Добавить карту</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAddCardSection = () => (
    <div className="account-section">
      <div className="section-header">
        <h2 className="section-title">
          {editingCardId ? 'Редактировать карту' : 'Добавить карту'}
        </h2>
        <button 
          className="back-button"
          onClick={handleCancelCardEdit}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад к картам
        </button>
      </div>
      
      <div className="add-card-form">
        <div className="card-preview">
          <div className="card-front active-card">
            <div className="card-chip"></div>
            <div className="card-number-preview">
              {cardData.number ? formatCardNumber(cardData.number) : '•••• •••• •••• ••••'}
            </div>
            <div className="card-details-preview">
              <div className="card-holder-preview">
                {cardData.cardHolder || 'ИМЯ ВЛАДЕЛЬЦА'}
              </div>
              <div className="card-expiry-preview">
                {cardData.expiry || 'ММ/ГГ'}
              </div>
            </div>
            <div className="card-type-preview">
              {detectCardType(cardData.number)}
            </div>
          </div>
        </div>
        
        <form onSubmit={editingCardId ? handleUpdateCard : handleAddCard} className="card-form">
          <div className="form-group full-width">
            <label className="form-label">Номер карты *</label>
            <input
              type="text"
              name="number"
              value={cardData.number}
              onChange={handleCardInputChange}
              className="form-input"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {cardErrors.number && <span className="error-text">{cardErrors.number}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Имя владельца *</label>
            <input
              type="text"
              name="cardHolder"
              value={cardData.cardHolder}
              onChange={handleCardInputChange}
              className="form-input"
              placeholder="IVAN IVANOV"
              style={{ textTransform: 'uppercase' }}
            />
            {cardErrors.cardHolder && <span className="error-text">{cardErrors.cardHolder}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Срок действия *</label>
            <input
              type="text"
              name="expiry"
              value={cardData.expiry}
              onChange={handleCardInputChange}
              className="form-input"
              placeholder="ММ/ГГ"
              maxLength="5"
            />
            {cardErrors.expiry && <span className="error-text">{cardErrors.expiry}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              CVV {!editingCardId && '*'}
              {editingCardId && <span className="optional-text"> (необязательно)</span>}
            </label>
            <input
              type="password"
              name="cvv"
              value={cardData.cvv}
              onChange={handleCardInputChange}
              className="form-input"
              placeholder="123"
              maxLength="3"
            />
            {cardErrors.cvv && <span className="error-text">{cardErrors.cvv}</span>}
            {editingCardId && (
              <span className="hint-text">Оставьте пустым, если не хотите менять CVV</span>
            )}
          </div>
          
          <div className="form-group full-width">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={cardData.isDefault}
                onChange={(e) => setCardData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Сделать основной картой для оплаты
            </label>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn" 
              disabled={!isCardFormValid()}
            >
              {editingCardId ? 'Обновить карту' : 'Сохранить карту'}
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancelCardEdit}>
              Отмена
            </button>
          </div>
          
          <div className="security-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Ваши данные защищены и передаются в зашифрованном виде</span>
          </div>
        </form>
      </div>
    </div>
  );

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
          {activeSection === 'add-card' && renderAddCardSection()}
          {activeSection === 'delete' && renderDeleteSection()}
        </div>
      </div>
    </div>
  );
};

export default Account;