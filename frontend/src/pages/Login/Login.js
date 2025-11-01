import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

// Импортируем изображения
import food1 from '../../assets/images/food1.jpg';
import food2 from '../../assets/images/food2.jpg';
import food3 from '../../assets/images/food3.jpg';
import food4 from '../../assets/images/food4.jpg';
import food5 from '../../assets/images/food5.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [currentImage, setCurrentImage] = useState(0);
  const { login } = useAuth();
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
    const user = login(formData.email, formData.password);
    if (user) {
      navigate('/'); // Возвращаем на главную после успешного входа
    } else {
      alert('Неверный email или пароль');
    }
  };

  const handleIndicatorClick = (index) => {
    setCurrentImage(index);
  };

  return (
    <div className="login-container">
      {/* Контейнер формы */}
      <div className="form-container">
        <h1 className="login-title">Войти</h1>
        <p className="login-subtitle">
          Войдите, чтобы получить доступ к своей учетной записи
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-with-label">
              <span className="field-label">Почта</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите вашу почту"
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <div className="input-with-label">
              <span className="field-label">Пароль</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите ваш пароль"
                required
              />
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Запомни меня
            </label>
            <a href="/forgot-password" className="forgot-password">
              Забыли пароль?
            </a>
          </div>
          
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
        
        <div className="social-login">
          <button className="google-button">
            <span className="google-icon">G</span>
            Войти через Google
          </button>
        </div>
        
        <p className="signup-link">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </div>

      {/* Контейнер с фотками */}
      <div className="login-images-container">
        <div className="login-image-slider">
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
    </div>
  );
};

export default Login;