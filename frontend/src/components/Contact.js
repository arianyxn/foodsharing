import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';
import contactBg from '../assets/images/contact-bg.jpg';

const Contact = () => {
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

  const handleSendRequest = () => {
    console.log('Отправка запроса...');
  };

  return (
    <section className={`contact ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
      <div className="contact-background">
        <img src={contactBg} alt="Contact background" />
      </div>
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-subtitle">/свяжитесь с нами</div>
          <h2 className="contact-title">Откроейте возможности партнерства</h2>
          <button className="contact-button" onClick={handleSendRequest}>
            отправить запрос
          </button>
        </div>
      </div>
    </section>
  );
};

export default Contact;