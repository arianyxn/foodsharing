import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">//LOW<span className="logo-low">LOW</span></div>
        
        <div className="nav-right-section">
          <div className="nav-links">
            <a href="#main" className="nav-link">Главная</a>
            <a href="#about" className="nav-link">О нас</a>
            <a href="#catalog" className="nav-link">Каталог</a>
            <a href="#contacts" className="nav-link">Контакты</a>
          </div>
          
          <button className="login-btn">Войти</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;