import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const scrollToFooter = () => {
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">//LOW<span className="logo-low">LOW</span></div>
        
        <div className="nav-right-section">
          <div className="nav-links">
            <a href="#main" className="nav-link" onClick={(e) => {
              e.preventDefault();
              scrollToSection('main');
            }}>Главная</a>
            <a href="#about" className="nav-link" onClick={(e) => {
              e.preventDefault();
              scrollToSection('about');
            }}>О нас</a>
            <a href="#catalog" className="nav-link" onClick={(e) => {
              e.preventDefault();
              scrollToSection('catalog');
            }}>Каталог</a>
            <a href="#contacts" className="nav-link" onClick={(e) => {
              e.preventDefault();
              scrollToFooter();
            }}>Контакты</a>
          </div>
          
          <button className="login-btn" onClick={handleLoginClick}>Войти</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;