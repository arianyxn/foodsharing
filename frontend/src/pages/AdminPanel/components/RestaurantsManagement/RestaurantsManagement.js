// src/pages/AdminPanel/components/RestaurantsManagement/RestaurantsManagement.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './RestaurantsManagement.css';

const RestaurantsManagement = () => {
  const { users, updateUserStatus, deleteUser } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
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

  useEffect(() => {
    const businessUsers = users.filter(user => user.role === 'business');
    setRestaurants(businessUsers);
  }, [users]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.directorFirstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === 'all' || restaurant.city === filterCity;
    return matchesSearch && matchesCity;
  });

  const cities = [...new Set(restaurants.map(r => r.city).filter(Boolean))];

  const handleToggleStatus = async (restaurantId, currentStatus) => {
    try {
      await updateUserStatus(restaurantId, !currentStatus);
      setRestaurants(prev => prev.map(restaurant => 
        restaurant.id === restaurantId ? { ...restaurant, isActive: !currentStatus } : restaurant
      ));
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот ресторан?')) {
      try {
        await deleteUser(restaurantId);
        setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
      } catch (error) {
        console.error('Ошибка при удалении ресторана:', error);
      }
    }
  };

  const getWorkingHours = (restaurant) => {
    if (restaurant.openingTime && restaurant.closingTime) {
      return `${restaurant.openingTime} - ${restaurant.closingTime}`;
    }
    return 'Не указано';
  };

  return (
    <div className="restaurants-management" ref={sectionRef}>
      <div className={`management-content ${isVisible ? 'visible' : ''}`}>
        
        {/* Заголовок и управление */}
        <div className="management-header">
          <h2 className="management-title">Управление ресторанами</h2>
          <div className="management-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск ресторанов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterCity} 
              onChange={(e) => setFilterCity(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все города</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Статистика */}
        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredRestaurants.length}</div>
            <div className="stat-label">Всего ресторанов</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredRestaurants.filter(r => r.isActive !== false).length}
            </div>
            <div className="stat-label">Активных</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{cities.length}</div>
            <div className="stat-label">Городов</div>
          </div>
        </div>

        {/* Таблица */}
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Информация о ресторане</th>
                <th>Контактные данные</th>
                <th>Город</th>
                <th>Время работы</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant, index) => (
                <tr 
                  key={restaurant.id} 
                  className={restaurant.isActive === false ? 'inactive' : ''}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="restaurant-id">#{restaurant.id}</td>
                  <td className="restaurant-info">
                    <div className="restaurant-main">
                      <strong>{restaurant.companyName || 'Без названия'}</strong>
                      <span>BIN: {restaurant.bin || 'Не указан'}</span>
                    </div>
                    <div className="restaurant-director">
                      {restaurant.directorFirstName} {restaurant.directorLastName}
                    </div>
                  </td>
                  <td className="restaurant-contact">
                    <div>{restaurant.email}</div>
                    {restaurant.phone && <div>{restaurant.phone}</div>}
                  </td>
                  <td className="restaurant-city">
                    <span className="city-badge">
                      {restaurant.city || 'Не указан'}
                    </span>
                  </td>
                  <td className="restaurant-hours">
                    <span className="hours-badge">
                      {getWorkingHours(restaurant)}
                    </span>
                  </td>
                  <td className="restaurant-status">
                    <span className={`status-badge ${restaurant.isActive !== false ? 'active' : 'inactive'}`}>
                      {restaurant.isActive !== false ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="restaurant-actions">
                    <button
                      className={`action-btn status-btn ${restaurant.isActive !== false ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(restaurant.id, restaurant.isActive !== false)}
                    >
                      {restaurant.isActive !== false ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRestaurants.length === 0 && (
            <div className="no-data">
              <p>Рестораны не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantsManagement;