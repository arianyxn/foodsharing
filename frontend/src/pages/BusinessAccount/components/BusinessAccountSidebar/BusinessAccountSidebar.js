import React from 'react';
import './BusinessAccountSidebar.css';

const BusinessAccountSidebar = ({ 
  activeSection, 
  setActiveSection, 
  user, 
  onLogout, 
  onDeleteAccount 
}) => {
  return (
    <div className="business-account-sidebar">
      <div className="business-profile-card">
        <div className="business-avatar-large">
          {user?.avatar ? (
            <img src={user.avatar} alt="Business Logo" />
          ) : (
            <div className="business-avatar-placeholder-large">
              {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'B'}
            </div>
          )}
        </div>
        <div className="business-info-sidebar">
          <h3 className="business-name">
            {user?.companyName || 'Название компании'}
          </h3>
          <p className="business-email">{user?.email || 'email@company.com'}</p>
          <span className="business-badge">Бизнес-аккаунт</span>
        </div>
      </div>
      
      <nav className="business-account-nav">
        <button 
          className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Бизнес-профиль
        </button>
        <button 
          className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSection('products')}
        >
          Мои продукты
        </button>
        <button 
          className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          История заказов
        </button>
        <button 
          className={`nav-item ${activeSection === 'location' ? 'active' : ''}`}
          onClick={() => setActiveSection('location')}
        >
          Местоположение
        </button>
        
        <button 
          className="nav-item logout"
          onClick={onLogout}
        >
          Выйти из бизнес-аккаунта
        </button>
        
        <button 
          className={`nav-item delete ${activeSection === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveSection('delete')}
        >
          Удалить бизнес-аккаунт
        </button>
      </nav>
    </div>
  );
};

export default BusinessAccountSidebar;