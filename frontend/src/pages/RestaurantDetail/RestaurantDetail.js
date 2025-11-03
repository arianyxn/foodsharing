// src/components/RestaurantDetail/RestaurantDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RestaurantDetail.css';

// Компонент для всплывающих уведомлений
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, user: currentUser, createOrder } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [notification, setNotification] = useState(null);

  // Проверяем роли пользователей
  const isRestaurantOwner = currentUser && restaurant && currentUser.id === restaurant.id;
  const isBusinessUser = currentUser && currentUser.role === 'business';
  const isRegularUser = currentUser && currentUser.role === 'user';
  const canAddToCart = isRegularUser && !isRestaurantOwner;

  // Показ уведомления
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/restaurants');
      return;
    }
    
    loadRestaurantData();
    loadProducts();
  }, [id, users, currentUser, navigate]);

  // Загрузка данных ресторана
  const loadRestaurantData = () => {
    try {
      const foundRestaurant = users?.find(user => 
        user.id === parseInt(id) && user.role === 'business'
      );
      
      if (foundRestaurant) {
        setRestaurant(foundRestaurant);
      } else {
        console.log('Ресторан не найден');
        navigate('/restaurants');
      }
    } catch (error) {
      console.error('Ошибка загрузки ресторана:', error);
      navigate('/restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка продуктов ресторана
  const loadProducts = () => {
    try {
      const restaurantProducts = JSON.parse(
        localStorage.getItem(`products_${id}`)
      ) || [];
      
      // Фильтруем только активные продукты
      const activeProducts = restaurantProducts.filter(
        product => product.status === 'active'
      );
      
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // Фильтрация продуктов по категории и поиску
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.ingredients && product.ingredients.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // Проверяем, есть ли товар в корзине
  const isProductInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Получить количество товара в корзине
  const getProductQuantityInCart = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Добавление в корзину с уведомлением
  const addToCart = (product) => {
    if (!canAddToCart) {
      if (isRestaurantOwner) {
        showNotification('Владельцы ресторана не могут добавлять товары в корзину', 'warning');
      } else if (isBusinessUser) {
        showNotification('Компании не могут делать заказы в других ресторанах', 'warning');
      }
      return;
    }

    if (product.quantity === 0) {
      showNotification('Товар закончился', 'warning');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const maxQuantity = product.quantity || 10;
        if (existingItem.quantity >= maxQuantity) {
          showNotification(`Максимальное количество: ${maxQuantity}`, 'warning');
          return prevCart;
        }
        
        const updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        showNotification(`Добавлено в корзину: ${product.name}`, 'success');
        return updatedCart;
      } else {
        const newCart = [...prevCart, { ...product, quantity: 1 }];
        showNotification(`Добавлено в корзину: ${product.name}`, 'success');
        return newCart;
      }
    });
  };

  // Увеличение количества в корзине
  const increaseQuantity = (productId) => {
    if (!canAddToCart) return;
    
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const product = products.find(p => p.id === productId);
    const maxQuantity = product?.quantity || 10;

    if (item.quantity >= maxQuantity) {
      showNotification(`Максимальное количество: ${maxQuantity}`, 'warning');
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Уменьшение количества в корзине
  const decreaseQuantity = (productId) => {
    if (!canAddToCart) return;
    
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (item.quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    }
  };

  // Удаление из корзины
  const removeFromCart = (productId) => {
    if (!canAddToCart) return;
    
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      const updatedCart = prevCart.filter(item => item.id !== productId);
      if (product) {
        showNotification(`Удалено из корзины: ${product.name}`, 'info');
      }
      return updatedCart;
    });
  };

  // Общая сумма корзины
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Общее количество товаров в корзине
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Очистка корзины
  const clearCart = () => {
    if (!canAddToCart) return;
    
    if (window.confirm('Очистить корзину?')) {
      setCart([]);
      showNotification('Корзина очищена', 'info');
    }
  };

  // Оформление заказа
  const handleCheckout = async () => {
    if (!canAddToCart) {
      showNotification('У вас нет прав для оформления заказа', 'warning');
      return;
    }
    
    if (cart.length === 0) {
      showNotification('Корзина пуста', 'warning');
      return;
    }
    
    const totalPrice = getTotalPrice();
    
    try {
      // Получаем карты пользователя
      const userCards = JSON.parse(localStorage.getItem(`userCards_${currentUser.id}`)) || [];
      const defaultCard = userCards.find(card => card.isDefault);
      
      if (!defaultCard) {
        showNotification('Добавьте карту для оплаты', 'warning');
        return;
      }
      
      // Создаем данные заказа
      const orderData = {
        userId: currentUser.id,
        companyId: parseInt(id),
        companyName: restaurant.companyName,
        customerName: currentUser.nickname || currentUser.email,
        customerPhone: currentUser.phone || 'Не указан',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice,
        paymentMethod: 'card'
      };
      
      // Используем функцию createOrder из AuthContext
      const newOrder = createOrder(orderData);
      
      showNotification(`Заказ #${newOrder.id} успешно оформлен!`, 'success');
      setCart([]);
      setIsCartOpen(false);
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      if (error.message.includes('Недостаточно средств')) {
        setShowPaymentError(true);
      } else {
        showNotification('Ошибка оформления заказа', 'error');
      }
    }
  };

  // Получение карты по умолчанию
  const getDefaultCard = () => {
    const userCards = JSON.parse(localStorage.getItem(`userCards_${currentUser.id}`)) || [];
    return userCards.find(card => card.isDefault);
  };

  // Получение текста для кнопки добавления в корзину
  const getAddToCartButtonText = (product) => {
    if (isRestaurantOwner) {
      return 'Ваш продукт';
    } else if (isBusinessUser) {
      return 'Только просмотр';
    } else if (product.quantity === 0) {
      return 'Нет в наличии';
    } else {
      return 'В корзину';
    }
  };

  // Получение класса для кнопки добавления в корзину
  const getAddToCartButtonClass = (product) => {
    if (isRestaurantOwner || isBusinessUser || product.quantity === 0) {
      return 'add-to-cart-btn disabled';
    }
    return 'add-to-cart-btn';
  };

  if (loading) {
    return (
      <div className="restaurant-detail-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка ресторана...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-not-found">
        <h2>Ресторан не найден</h2>
        <button onClick={() => navigate('/restaurants')}>
          Вернуться к ресторанам
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-detail">
      {/* Всплывающие уведомления */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Упрощенная шапка ресторана */}
      <div className="restaurant-header-simple">
        <div className="restaurant-info-simple">
          <div className="restaurant-avatar-simple">
            {restaurant.avatar ? (
              <img src={restaurant.avatar} alt={restaurant.companyName} />
            ) : (
              <div className="avatar-placeholder-simple">
                {restaurant.companyName?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="restaurant-details-simple">
            <h1 className="restaurant-title-simple">{restaurant.companyName}</h1>
            <div className="restaurant-working-hours">
              🕒 Время работы: 10:00 - 22:00
            </div>
            {isRestaurantOwner && (
              <div className="owner-badge-simple">
                🔧 Это ваш ресторан
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="restaurant-content">
        {/* Навигация категорий */}
        <div className="categories-nav">
          <div className="categories-scroll">
            {['all', 'Бургеры', 'Пицца', 'Закуски', 'Десерты', 'Супы', 'Салаты', 'Напитки', 'Другое'].map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Все' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Поиск */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск продуктов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Сетка продуктов */}
        <div className="products-section">
          <h2 className="products-title">Меню</h2>
          
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🍽️</div>
              <h3>Продукты не найдены</h3>
              <p>
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Попробуйте изменить поисковый запрос или выбрать другую категорию'
                  : 'В этом ресторане пока нет доступных продуктов'
                }
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => {
                const isInCart = isProductInCart(product.id);
                const quantityInCart = getProductQuantityInCart(product.id);
                
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img 
                        src={product.image || '/default-product.jpg'} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/default-product.jpg';
                        }}
                      />
                      {product.quantity !== undefined && product.quantity > 0 && (
                        <div className="quantity-badge">
                          В наличии: {product.quantity}
                        </div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      
                      {product.ingredients && (
                        <p className="product-ingredients">
                          {product.ingredients}
                        </p>
                      )}
                      
                      <div className="product-footer">
                        <div className="product-price">
                          {product.price.toLocaleString()} ₸
                        </div>
                        <div className="product-actions">
                          {!isInCart ? (
                            <button
                              className={getAddToCartButtonClass(product)}
                              onClick={() => addToCart(product)}
                              disabled={!canAddToCart || product.quantity === 0}
                            >
                              {getAddToCartButtonText(product)}
                            </button>
                          ) : (
                            <div className="quantity-controls">
                              <button
                                className="quantity-btn decrease"
                                onClick={() => decreaseQuantity(product.id)}
                                disabled={!canAddToCart}
                              >
                                -
                              </button>
                              <span className="quantity-display">{quantityInCart}</span>
                              <button
                                className="quantity-btn increase"
                                onClick={() => increaseQuantity(product.id)}
                                disabled={!canAddToCart || quantityInCart >= (product.quantity || 10)}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка корзины (только для обычных пользователей) */}
      {canAddToCart && cart.length > 0 && !isCartOpen && (
        <div className="cart-floating-button">
          <button 
            className="cart-toggle-btn"
            onClick={() => setIsCartOpen(true)}
          >
            🛒 Корзина ({getTotalItems()})
            <span className="cart-total-price">{getTotalPrice().toLocaleString()} ₸</span>
          </button>
        </div>
      )}

      {/* Боковая панель корзины (только для обычных пользователей) */}
      {canAddToCart && isCartOpen && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>Корзина</h3>
            <div className="cart-header-actions">
              <button 
                className="clear-cart-btn"
                onClick={clearCart}
                title="Очистить корзину"
              >
                🗑️
              </button>
              <button 
                className="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">{item.price.toLocaleString()} ₸</p>
                </div>
                
                <div className="cart-item-controls">
                  <button
                    className="quantity-btn decrease"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  
                  <span className="cart-item-quantity">{item.quantity}</span>
                  
                  <button
                    className="quantity-btn increase"
                    onClick={() => increaseQuantity(item.id)}
                    disabled={item.quantity >= (item.quantity || 10)}
                  >
                    +
                  </button>
                  
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Удалить из корзины"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-footer">
            <div className="cart-total">
              Итого: <span>{getTotalPrice().toLocaleString()} ₸</span>
            </div>
            <div className="payment-info">
              <div className="card-selection">
                <span>Карта для оплаты:</span>
                <span className="selected-card">
                  {getDefaultCard() ? `•••• ${getDefaultCard().last4}` : 'Не выбрана'}
                </span>
              </div>
              {!getDefaultCard() && (
                <div className="no-card-warning">
                  ⚠️ Добавьте карту в разделе "Мои карты"
                </div>
              )}
            </div>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={!getDefaultCard()}
            >
              {getDefaultCard() ? 'Оформить заказ' : 'Добавьте карту для оплаты'}
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки оплаты (УПРОЩЕННОЕ) */}
      {showPaymentError && (
        <div className="payment-error-overlay">
          <div className="payment-error-modal">
            <div className="payment-error-header">
              <h3>Недостаточно средств</h3>
              <button 
                className="close-error-btn"
                onClick={() => setShowPaymentError(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="payment-error-content">
              <div className="error-details">
                <p>На вашей карте недостаточно средств для оплаты заказа.</p>
              </div>
            </div>
            
            <div className="payment-error-actions">
              <button 
                className="cancel-error-btn"
                onClick={() => setShowPaymentError(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Затемнение фона когда корзина открыта */}
      {canAddToCart && isCartOpen && (
        <div 
          className="cart-overlay"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default RestaurantDetail;