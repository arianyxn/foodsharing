import React, { useState, useEffect, useRef } from 'react';
import './Steps.css';

const Steps = () => {
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
        threshold: 0.3, // Сработает когда 30% секции будет видно
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
    <section className={`steps ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
      <div className="steps-container">
        {/* Верхний контейнер */}
        <div className="steps-top">
          <div className="steps-header">
            <div className="steps-subtitle">/наша цель</div>
            <div className="steps-title">
              <span className="title-line">Совместное</span>
              <span className="title-line">использование еды</span>
            </div>
          </div>
          <div className="steps-description">
            Наши партнеры делятся свежими продуктами и блюдами, помогая друг другу и заботясь о планете.
          </div>
        </div>

        {/* Нижний контейнер с шагами */}
        <div className="steps-bottom">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-text">Доступность еды для всех</div>
          </div>
          
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-text">Повышение социальной ответственности</div>
          </div>
          
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-text">Снижение излишков еды</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;