import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

// Импортируем изображения
import food1 from '../../assets/images/food1.jpg';
import food2 from '../../assets/images/food2.jpg';
import food3 from '../../assets/images/food3.jpg';
import food4 from '../../assets/images/food4.jpg';
import food5 from '../../assets/images/food5.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [currentImage, setCurrentImage] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  const images = [food1, food2, food3, food4, food5];

  // Автоматическая смена фоток
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    if (!formData.agreeTerms) {
      alert('Необходимо согласиться с условиями');
      return;
    }

    // Проверяем, нет ли уже пользователя с таким email
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(user => user.email === formData.email);
    if (existingUser) {
      alert('Пользователь с таким email уже существует');
      return;
    }

    const user = register({
      nickname: formData.nickname,
      email: formData.email,
      password: formData.password
    });

    if (user) {
      navigate('/'); // Возвращаем на главную после успешной регистрации
    }
  };

  const handleIndicatorClick = (index) => {
    setCurrentImage(index);
  };

  return (
    <div className="register-container">
      {/* Контейнер с фотками - теперь слева */}
      <div className="register-images-container">
        <div className="register-image-slider">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`image-slide ${index === currentImage ? 'active' : ''}`}
            >
              <img src={image} alt={`Food ${index + 1}`} />
            </div>
          ))}
        </div>
        
        {/* Индикаторы */}
        <div className="image-indicators">
          {images.map((_, index) => (
            <div
              key={index}
              className={`image-indicator ${index === currentImage ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Контейнер формы - теперь справа */}
      <div className="form-container">
        <h1 className="register-title">Добро пожаловать</h1>
        <p className="register-subtitle">
          LOW.LOW - платформа, который спасает продукты перед сроком, продавая их дешевле
        </p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Никнейм"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Почта"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              required
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Я согласен с условиями пользовательского соглашения
            </label>
          </div>
          
          <button type="submit" className="register-button">
            Зарегистрироваться
          </button>
        </form>
        
        <div className="social-login">
          <button className="google-button">
            <span className="google-icon">G</span>
            Зарегистрироваться через Google
          </button>
        </div>
        
        <p className="login-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;