// src/pages/AdminPanel/components/UsersManagement/UsersManagement.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './UsersManagement.css';

const UsersManagement = () => {
  const { users, updateUserStatus, deleteUser } = useAuth();
  const [localUsers, setLocalUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
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
    setLocalUsers(users);
  }, [users]);

  const filteredUsers = localUsers.filter(user => {
    const matchesSearch = user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      setLocalUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteUser(userId);
        setLocalUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
      }
    }
  };

  const getRoleDisplay = (role) => {
    const roles = {
      'customer': 'Покупатель',
      'business': 'Бизнес',
      'admin': 'Администратор'
    };
    return roles[role] || role;
  };

  return (
    <div className="users-management" ref={sectionRef}>
      <div className={`management-content ${isVisible ? 'visible' : ''}`}>
        
        {/* Заголовок и управление */}
        <div className="management-header">
          <h2 className="management-title">Управление пользователями</h2>
          <div className="management-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все роли</option>
              <option value="customer">Покупатели</option>
              <option value="business">Бизнес</option>
              <option value="admin">Администраторы</option>
            </select>
          </div>
        </div>

        {/* Статистика */}
        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredUsers.length}</div>
            <div className="stat-label">Всего пользователей</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredUsers.filter(u => u.isActive !== false).length}
            </div>
            <div className="stat-label">Активных</div>
          </div>
        </div>

        {/* Таблица */}
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Информация</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={user.isActive === false ? 'inactive' : ''}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="user-id">#{user.id}</td>
                  <td className="user-info">
                    <div className="user-main">
                      <strong>{user.nickname || user.companyName || 'Без имени'}</strong>
                      <span>{user.email}</span>
                    </div>
                    {user.phone && <div className="user-phone">{user.phone}</div>}
                  </td>
                  <td className="user-role">
                    <span className={`role-badge ${user.role}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="user-status">
                    <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                      {user.isActive !== false ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="user-date">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="user-actions">
                    <button
                      className={`action-btn status-btn ${user.isActive !== false ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                    >
                      {user.isActive !== false ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="no-data">
              <p>Пользователи не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;