// src/components/Account/AccountOrders/AccountOrders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import './AccountOrders.css';

const AccountOrders = () => {
  const navigate = useNavigate();
  const { user, getUserOrders } = useAuth();
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      const orders = getUserOrders(user.id);
      // Сортируем по дате создания (новые сверху)
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUserOrders(sortedOrders);
    }
  }, [user, getUserOrders]);

  const handleBrowseProducts = () => {
    navigate('/restaurants');
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

  return (
    <div className="account-section">
      <div className="section-header">
        <h2 className="section-title">Мои заказы</h2>
      </div>
      
      {userOrders.length > 0 ? (
        <div className="orders-checks">
          {userOrders.map(order => {
            const { date, time } = formatDateTime(order.createdAt);
            return (
              <div key={order.id} className="order-check">
                <div className="check-header">
                  <div className="check-restaurant">
                    <h3>{order.companyName || 'Ресторан'}</h3>
                    <span className="check-order-id">#{order.id}</span>
                  </div>
                  <div className="check-date">
                    {date} в {time}
                  </div>
                </div>
                
                <div className="check-items">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="check-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">×{item.quantity}</span>
                      <span className="item-price">{(item.price * item.quantity).toLocaleString()} ₸</span>
                    </div>
                  ))}
                </div>
                
                <div className="check-footer">
                  <div className="check-total">
                    <span>Итого:</span>
                    <strong>{order.total ? order.total.toLocaleString() : '0'} ₸</strong>
                  </div>
                  <div className="check-status">
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
                
                {order.cardLast4 && (
                  <div className="check-payment">
                    💳 Оплачено картой: •••• {order.cardLast4}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-orders">
          <div className="orders-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>У вас пока нет заказов</h3>
          <p>После оформления заказа вы сможете отслеживать его статус здесь</p>
          <button className="browse-products-btn" onClick={handleBrowseProducts}>
            Перейти к каталогу
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountOrders;