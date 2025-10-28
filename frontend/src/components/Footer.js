import React, { useState, useEffect, useRef } from 'react';
import './Footer.css';

const Footer = () => {
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
        threshold: 0.3,
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

  return (
    <footer className={`footer ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
      {/* Логотип */}
      <div className="footer-logo">LOWLOW</div>
      
      {/* Нижний контейнер с тремя колонками */}
      <div className="footer-bottom">
        
        {/* 1 контейнер слева */}
        <div className="footer-left">
          <div className="footer-brand">//LOW<span className="brand-transparent">LOW</span></div>
          <div className="footer-address">AITU, Astana City</div>
        </div>
        
        {/* 2 контейнер по центру */}
        <div className="footer-center">
          <div className="footer-nav-title">НАВИГАЦИЯ</div>
          <nav className="footer-nav">
            <a href="#about" className="footer-nav-link">О нас</a>
            <a href="#partners" className="footer-nav-link">Партнеры</a>
            <a href="#catalog" className="footer-nav-link">Каталог</a>
          </nav>
        </div>
        
        {/* 3 контейнер справа */}
        <div className="footer-right">
          <div className="footer-subscribe-title">ПОДПИШИТЕСЬ</div>
          <div className="footer-social">
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Telegram</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;