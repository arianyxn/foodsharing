// src/pages/AdminPanel/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import UsersManagement from './components/UsersManagement/UsersManagement';
import RestaurantsManagement from './components/RestaurantsManagement/RestaurantsManagement';
import ProductsManagement from './components/ProductsManagement/ProductsManagement';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Проверка прав администратора
  if (user?.role !== 'admin') {
    return (
      <div className="admin-panel-container access-denied-page" ref={sectionRef}>
        <div className={`access-denied-content ${isVisible ? 'visible' : ''}`}>
          <h2>Доступ запрещен</h2>
          <p>У вас нет прав для доступа к панели администратора.</p>
          <p>Пожалуйста, войдите под учетной записью администратора.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container" ref={sectionRef}>
      <div className={`admin-content-wrapper ${isVisible ? 'visible' : ''}`}>
        
        {/* Шапка админ-панели */}
        <div className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-title">LOW<span className="title-transparent">LOW</span> Admin</h1>
          </div>
          <div className="admin-user-info">
            <span>Администратор: <strong>{user.nickname || user.email}</strong></span>
          </div>
        </div>

        {/* Навигационные вкладки */}
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
          <button 
            className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Рестораны
          </button>
          <button 
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Продукты
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="admin-main-content">
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'restaurants' && <RestaurantsManagement />}
          {activeTab === 'products' && <ProductsManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;