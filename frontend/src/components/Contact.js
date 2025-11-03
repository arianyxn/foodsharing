// src/components/Contact.js
import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';
import contactBg from '../assets/images/contact-bg.jpg';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ email: '', message: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Сохраняем запрос в localStorage
    const partnershipRequests = JSON.parse(localStorage.getItem('partnershipRequests')) || [];
    const newRequest = {
      id: Date.now(),
      email: formData.email,
      message: formData.message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    
    partnershipRequests.push(newRequest);
    localStorage.setItem('partnershipRequests', JSON.stringify(partnershipRequests));
    
    alert('Ваш запрос отправлен! Мы свяжемся с вами в ближайшее время.');
    handleCloseModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <section className={`contact ${isVisible ? 'visible' : ''}`} ref={sectionRef} id="contacts">
        <div className="contact-background">
          <img src={contactBg} alt="Contact background" />
        </div>
        <div className="contact-container">
          <div className="contact-content">
            <div className="contact-subtitle">/свяжитесь с нами</div>
            <h2 className="contact-title">Откройте возможности партнерства</h2>
            <button className="contact-button" onClick={handleSendRequest}>
              отправить запрос
            </button>
          </div>
        </div>
      </section>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Запрос на партнерство</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-instruction">
              <h4>Инструкция по заполнению:</h4>
              <p>Для сотрудничества с нами нам потребуется следующая информация:</p>
              <ul>
                <li>Название вашего заведения</li>
                <li>Тип кухни или услуг</li>
                <li>Местоположение</li>
                <li>Контактные данные для связи</li>
                <li>Дополнительная информация о вашем бизнесе</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="partnership-form">
              <div className="form-group">
                <label>Ваша почта *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Информация для сотрудничества *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Опишите подробно информацию о вашем заведении и предложении о сотрудничестве..."
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                Отправить запрос
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;