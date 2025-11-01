import React, { useState, useEffect, useRef } from 'react';
import './MiniCatalog.css';

// Импортируем изображения категорий
import vegetables from '../assets/catalog/vegetables.png';
import bakery from '../assets/catalog/bakery.png';
import milk from '../assets/catalog/milk.png';
import cereals from '../assets/catalog/cereals.png';

const MiniCatalog = () => {
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

  const categories = [
    { image: vegetables, name: "VEGETABLES", key: "vegetables" },
    { image: bakery, name: "BAKERY", key: "bakery" },
    { image: milk, name: "MILK", key: "milk" },
    { image: cereals, name: "CEREALS", key: "cereals" }
  ];

  const handleCategoryClick = (categoryKey) => {
    console.log(`Clicked category: ${categoryKey}`);
  };

  return (
    <section className={`mini-catalog ${isVisible ? 'visible' : ''}`} ref={sectionRef}>
      <div className="catalog-container">
        {/* Верхний контейнер */}
        <div className="catalog-top">
          <div className="catalog-header">
            <div className="catalog-subtitle">/новости мира</div>
            <h1 className="catalog-title">
              Что происходит в мире<br />фудшеринга
            </h1>
          </div>
          <button className="catalog-button">
            к новостям
          </button>
        </div>

        {/* Разделительная линия */}
        <div className="divider"></div>

        {/* Нижний контейнер с категориями */}
        <div className="catalog-bottom">
          <div className="categories-grid">
            {categories.map((category, index) => (
              <button
                key={category.key}
                className={`category-item category-${index + 1}`}
                onClick={() => handleCategoryClick(category.key)}
              >
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                />
                <div className="category-overlay">
                  <span className="category-name">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniCatalog;