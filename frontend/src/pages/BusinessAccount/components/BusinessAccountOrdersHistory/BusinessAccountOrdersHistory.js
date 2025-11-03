// src/components/BusinessAccount/BusinessAccountOrdersHistory/BusinessAccountOrdersHistory.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './BusinessAccountOrdersHistory.css';

const BusinessAccountOrdersHistory = ({ user }) => {
  const { getCompanyOrders, updateOrderStatus } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      const companyOrders = getCompanyOrders(user.id);
      // Сортируем по дате создания (новые сверху)
      const sortedOrders = companyOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    }
  }, [user, getCompanyOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrder = updateOrderStatus(orderId, newStatus);
    if (updatedOrder) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'pending': return 'В обработке';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#ffa726';
      case 'cancelled': return '#f44336';
      default: return '#6c757d';
    }
  };

  // Сокращаем номер заказа
  const getShortOrderId = (orderId) => {
    return `#${orderId.toString().slice(-6)}`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.total, 0);
  };

  const getOrdersCount = (status) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="business-account-section">
      <div className="section-header">
        <h2 className="section-title">Заказы клиентов</h2>
      </div>

      {/* Статистика */}
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getOrdersCount('pending')}</div>
          <div className="stat-label">В обработке</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getOrdersCount('completed')}</div>
          <div className="stat-label">Завершено</div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-value">{getTotalRevenue().toLocaleString()} ₸</div>
          <div className="stat-label">Общая выручка</div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map(order => {
            const { date, time } = formatDateTime(order.createdAt);
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Заказ {getShortOrderId(order.id)}</h3>
                    <span className="order-customer">
                      👤 {order.customerName}
                      {order.customerPhone && (
                        <span className="customer-phone"> • {order.customerPhone}</span>
                      )}
                    </span>
                    <span className="order-date">
                      📅 {date} • 🕒 {time}
                    </span>
                  </div>
                  <div className="order-status">
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
                
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">×{item.quantity}</span>
                      <span className="item-price">{(item.price * item.quantity).toLocaleString()} ₸</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    Итого: <strong>{order.total ? order.total.toLocaleString() : '0'} ₸</strong>
                  </div>
                  
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <>
                        <button 
                          className="complete-order-btn"
                          onClick={() => handleStatusChange(order.id, 'completed')}
                        >
                          ✅ Получено
                        </button>
                        <button 
                          className="cancel-order-btn"
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                        >
                          ❌ Отменить
                        </button>
                      </>
                    )}
                    {order.status === 'completed' && (
                      <span className="completed-text">✅ Заказ получен</span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="cancelled-text">❌ Заказ отменен</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Заказов пока нет</h3>
            <p>Здесь будут отображаться заказы от ваших клиентов</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAccountOrdersHistory;