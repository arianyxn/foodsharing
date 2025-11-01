import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const scrollToFooter = () => {
    // Если мы не на главной странице, сначала переходим на главную
    if (location.pathname !== '/') {
      navigate('/');
      // Даем время для загрузки главной страницы перед скроллом
      setTimeout(() => {
        const footer = document.getElementById('footer');
        if (footer) {
          footer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const footer = document.getElementById('footer');
      if (footer) {
        footer.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const scrollToSection = (sectionId) => {
    // Если мы не на главной странице, сначала переходим на главную
    if (location.pathname !== '/') {
      navigate('/');
      // Даем время для загрузки главной страницы перед скроллом
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/account');
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // Если уже на главной, скроллим наверх
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
          //LOW<span className="logo-low">LOW</span>
        </div>
        
        <div className="nav-right-section">
          <div className="nav-links">
            <a href="#main" className="nav-link" onClick={(e) => {
              e.preventDefault();
              if (location.pathname !== '/') {
                navigate('/');
              } else {
                scrollToSection('main');
              }
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
          
          {user ? (
            <div className="user-profile">
              <div className="user-info" onClick={handleProfileClick}>
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : 
                       user.nickname ? user.nickname.charAt(0).toUpperCase() : 
                       user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="user-greeting">
                  <span className="welcome-text">С возвращением</span>
                  <span className="username">
                    {user.firstName || user.nickname || user.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button className="login-btn" onClick={handleLoginClick}>Войти</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;