import React from 'react';
import './BusinessAccountLocation.css';

const BusinessAccountLocation = () => {
  return (
    <div className="business-account-section">
      <h2 className="section-title">Местоположение компании</h2>
      
      <div className="location-content">
        <div className="map-placeholder">
          <div className="map-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 21 12 21C12 21 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Карта местоположения компании</h3>
          <p>Здесь будет отображаться местоположение вашей компании для клиентов</p>
          <button className="location-btn">
            Настроить местоположение
          </button>
        </div>
        
        <div className="location-info">
          <h4>Информация о местоположении</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Адрес:</span>
              <span className="info-value">г. Алматы, ул. Абая 123</span>
            </div>
            <div className="info-item">
              <span className="info-label">Город:</span>
              <span className="info-value">Алматы</span>
            </div>
            <div className="info-item">
              <span className="info-label">Часы работы:</span>
              <span className="info-value">09:00 - 23:00</span>
            </div>
            <div className="info-item">
              <span className="info-label">Доставка:</span>
              <span className="info-value">До 5 км</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAccountLocation;