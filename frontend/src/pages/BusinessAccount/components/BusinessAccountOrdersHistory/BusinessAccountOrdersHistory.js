import React from 'react';
import './BusinessAccountOrdersHistory.css';

const BusinessAccountOrdersHistory = ({ user }) => {
  // Заглушка для истории заказов
  const orders = [
    { 
      id: 1, 
      date: '2024-01-15', 
      time: '14:30',
      customer: 'Иван Иванов', 
      total: 4500, 
      status: 'completed',
      items: ['Пицца Маргарита', 'Кофе Латте']
    },
    { 
      id: 2, 
      date: '2024-01-14', 
      time: '19:15',
      customer: 'Мария Петрова', 
      total: 3200, 
      status: 'completed',
      items: ['Бургер Классик', 'Салат Цезарь']
    },
    { 
      id: 3, 
      date: '2024-01-13', 
      time: '12:45',
      customer: 'Алексей Сидоров', 
      total: 2800, 
      status: 'cancelled',
      items: ['Чизкейк', 'Кофе Латте']
    },
    { 
      id: 4, 
      date: '2024-01-12', 
      time: '20:30',
      customer: 'Елена Козлова', 
      total: 5200, 
      status: 'completed',
      items: ['Пицца Маргарита', 'Бургер Классик', 'Салат Цезарь']
    }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      case 'pending': return 'В обработке';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#ff6b6b';
      case 'pending': return '#ffa726';
      default: return '#rgba(255, 255, 255, 0.7)';
    }
  };

  return (
    <div className="business-account-section">
      <div className="section-header">
        <h2 className="section-title">История заказов</h2>
        <div className="orders-filters">
          <select className="filter-select">
            <option value="all">Все заказы</option>
            <option value="completed">Завершенные</option>
            <option value="cancelled">Отмененные</option>
            <option value="pending">В обработке</option>
          </select>
        </div>
      </div>
      
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.filter(o => o.status === 'completed').length}</div>
          <div className="stat-label">Завершенные</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.filter(o => o.status === 'cancelled').length}</div>
          <div className="stat-label">Отмененные</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length)} ₸
          </div>
          <div className="stat-label">Средний чек</div>
        </div>
      </div>
      
      <div className="orders-table-container">
        <div className="table-header">
          <div className="table-cell">ID заказа</div>
          <div className="table-cell">Дата и время</div>
          <div className="table-cell">Клиент</div>
          <div className="table-cell">Состав заказа</div>
          <div className="table-cell">Сумма</div>
          <div className="table-cell">Статус</div>
        </div>
        
        {orders.map(order => (
          <div key={order.id} className="table-row">
            <div className="table-cell order-id">#{order.id}</div>
            <div className="table-cell order-date">
              <div className="date">{order.date}</div>
              <div className="time">{order.time}</div>
            </div>
            <div className="table-cell order-customer">{order.customer}</div>
            <div className="table-cell order-items">
              {order.items.map((item, index) => (
                <span key={index} className="order-item">{item}</span>
              ))}
            </div>
            <div className="table-cell order-total">{order.total.toLocaleString()} ₸</div>
            <div className="table-cell order-status">
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status),
                  borderColor: `${getStatusColor(order.status)}40`
                }}
              >
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Заказов пока нет</h3>
          <p>Здесь будет отображаться история заказов ваших клиентов</p>
        </div>
      )}
    </div>
  );
};

export default BusinessAccountOrdersHistory;