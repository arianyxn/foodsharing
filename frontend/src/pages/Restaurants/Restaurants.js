import React from 'react';
import './Restaurants.css';

// Импортируем изображения из папки assets
import restaurant1 from '../../assets/images/restaurant1.jpg';
import restaurant2 from '../../assets/images/restaurant2.jpg';
import restaurant3 from '../../assets/images/restaurant3.jpg';
import restaurant4 from '../../assets/images/restaurant4.jpg';
import restaurant5 from '../../assets/images/restaurant5.jpg';
// Добавляем БОЛЬШИЕ изображения для заголовка
import headerImage1 from '../../assets/images/header-food1.jpg';
import headerImage2 from '../../assets/images/header-food2.jpg';

const Restaurants = () => {
  const restaurants = [
    {
      id: 1,
      name: "ГМ Restaurants",
      deliveryTime: "25-30 минут",
      rating: 4.8,
      verified: true,
      image: restaurant1,
      price: "$$",
      distance: "1.2 km"
    },
    {
      id: 2,
      name: "Coffee Boom",
      deliveryTime: "50-55 минут",
      rating: 4.5,
      verified: true,
      image: restaurant2,
      price: "$$",
      distance: "2.1 km"
    },
    {
      id: 3,
      name: "Karima",
      deliveryTime: "40-45 минут",
      rating: 4.9,
      verified: true,
      image: restaurant3,
      price: "$$$",
      distance: "0.8 km"
    },
    {
      id: 4,
      name: "I'M Restaurants",
      deliveryTime: "35-50 минут",
      rating: 4.7,
      verified: true,
      image: restaurant4,
      price: "$$",
      distance: "1.5 km"
    },
    {
      id: 5,
      name: "Burger House",
      deliveryTime: "20-25 минут",
      rating: 4.6,
      verified: true,
      image: restaurant5,
      price: "$",
      distance: "0.5 km"
    }
  ];

  return (
    <section className="restaurants-page">
      <div className="restaurants-container">
        {/* Заголовок */}
        <div className="restaurants-header">
          <h1 className="restaurants-title">
            Бери выгоду без<br /> переплат
          </h1>
          <div className="header-content">
            <div className="header-text">
              <p className="header-description">
                Покупайте продукты вовремя, чтобы<br />
                блюда оставались вкусными и<br />
                ароматными
              </p>
            </div>
            <div className="header-images">
              <div className="header-image">
                <img src={headerImage1} alt="Food 1" />
              </div>
              <div className="header-image">
                <img src={headerImage2} alt="Food 2" />
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">Рейтинг кафе</span>
              <select className="filter-select">
                <option>Любой</option>
                <option>4.5+</option>
                <option>4.0+</option>
                <option>3.5+</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Расстояние</span>
              <select className="filter-select">
                <option>Ближайшие</option>
                <option>До 1 км</option>
                <option>До 2 км</option>
                <option>До 5 км</option>
              </select>
            </div>
          </div>
        </div>

        {/* Сетка ресторанов */}
        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="restaurant-image">
                <img src={restaurant.image} alt={restaurant.name} />
                <div className="image-overlay">
                  <div className="rating-badge">
                    ⭐ {restaurant.rating}
                  </div>
                  {restaurant.verified && (
                    <div className="verified-badge">
                      ✓
                    </div>
                  )}
                </div>
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="delivery-time">{restaurant.deliveryTime}</p>
                <div className="restaurant-meta">
                  <span className="price">{restaurant.price}</span>
                  <span className="distance">{restaurant.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Restaurants;