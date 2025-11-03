// src/pages/AdminPanel/components/ProductsManagement/ProductsManagement.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const { users } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRestaurant, setFilterRestaurant] = useState('all');
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
        threshold: 0.1,
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

  useEffect(() => {
    loadProducts();
  }, [users]);

  const loadProducts = () => {
    try {
      const allProducts = [];
      users.forEach(user => {
        if (user.role === 'business' && user.products) {
          user.products.forEach(product => {
            allProducts.push({
              ...product,
              restaurantName: user.companyName || user.nickname,
              restaurantId: user.id,
              restaurant: user
            });
          });
        }
      });
      setProducts(allProducts);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const restaurants = [...new Set(products.map(p => p.restaurantName).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesRestaurant = filterRestaurant === 'all' || product.restaurantName === filterRestaurant;
    return matchesSearch && matchesCategory && matchesRestaurant;
  });

  const handleToggleStatus = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, isActive: !product.isActive } : product
    ));
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  };

  const getDiscountPercentage = (oldPrice, price) => {
    if (!oldPrice || !price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="products-management" ref={sectionRef}>
      <div className={`management-content ${isVisible ? 'visible' : ''}`}>
        
        {/* Заголовок и управление */}
        <div className="management-header">
          <h2 className="management-title">Управление продуктами</h2>
          <div className="management-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все категории</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={filterRestaurant} 
              onChange={(e) => setFilterRestaurant(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все рестораны</option>
              {restaurants.map(restaurant => (
                <option key={restaurant} value={restaurant}>{restaurant}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Статистика */}
        <div className="management-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredProducts.length}</div>
            <div className="stat-label">Всего продуктов</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredProducts.filter(p => p.isActive !== false).length}
            </div>
            <div className="stat-label">Активных</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{categories.length}</div>
            <div className="stat-label">Категорий</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{restaurants.length}</div>
            <div className="stat-label">Ресторанов</div>
          </div>
        </div>

        {/* Сетка продуктов */}
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`product-card ${product.isActive === false ? 'inactive' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image-placeholder">
                    {/* Без смайликов */}
                  </div>
                )}
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="discount-badge">
                    -{getDiscountPercentage(product.oldPrice, product.price)}%
                  </div>
                )}
              </div>
              
              <div className="product-content">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-category">{product.category}</span>
                </div>
                
                <p className="product-description">
                  {product.description || 'Описание отсутствует'}
                </p>
                
                <div className="product-restaurant">
                  <span className="restaurant-badge">
                    {product.restaurantName}
                  </span>
                </div>
                
                <div className="product-details">
                  <div className="product-price">
                    <div className="current-price">{formatPrice(product.price)} ₸</div>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <div className="old-price">{formatPrice(product.oldPrice)} ₸</div>
                    )}
                  </div>
                  
                  <div className="product-meta">
                    {product.expiryDate && (
                      <div className="expiry-date">
                        До: {product.expiryDate}
                      </div>
                    )}
                    {product.quantity && (
                      <div className="product-quantity">
                        В наличии: {product.quantity}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="product-actions">
                  <button
                    className={`action-btn status-btn ${product.isActive !== false ? 'deactivate' : 'activate'}`}
                    onClick={() => handleToggleStatus(product.id)}
                  >
                    {product.isActive !== false ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="no-data">
            <p>Продукты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;