import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RestaurantDetail.css';

// Импортируем изображения
import defaultProduct from '../../assets/images/default-product.jpg';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, user: currentUser } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Проверяем, является ли текущий пользователь владельцем ресторана
  const isRestaurantOwner = currentUser && restaurant && currentUser.id === restaurant.id;

  // Категории продуктов
  const categories = [
    'all', 'Бургеры', 'Пицца', 'Закуски', 'Десерты', 
    'Супы', 'Салаты', 'Напитки', 'Другое'
  ];

  // Время работы ресторана
  const workingHours = "10:00 - 22:00";

  useEffect(() => {
    // Просто проверяем авторизацию и редиректим
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

    // Фильтрация по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Фильтрация по поисковому запросу
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

  // Добавление в корзину
  const addToCart = (product) => {
    // Проверяем, не является ли пользователь владельцем ресторана
    if (isRestaurantOwner) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Проверяем максимальное количество
        const maxQuantity = product.quantity || 10;
        if (existingItem.quantity >= maxQuantity) {
          alert(`Максимальное количество для "${product.name}" - ${maxQuantity}`);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Удаление из корзины
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Изменение количества
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Находим продукт для проверки максимального количества
    const product = cart.find(item => item.id === productId);
    const maxQuantity = product?.quantity || 10;

    if (newQuantity > maxQuantity) {
      alert(`Максимальное количество для "${product.name}" - ${maxQuantity}`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
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
    if (window.confirm('Очистить корзину?')) {
      setCart([]);
    }
  };

  // Оформление заказа
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Здесь будет логика оформления заказа
    alert('Заказ оформлен! Сумма: ' + getTotalPrice().toLocaleString() + ' ₸');
    setCart([]);
    setIsCartOpen(false);
  };

  // Получение изображения продукта
  const getProductImage = (product) => {
    try {
      if (product.image && typeof product.image === 'string') {
        return product.image;
      }
      return defaultProduct;
    } catch (error) {
      return defaultProduct;
    }
  };

  // Убираем лишние проверки в рендере, просто показываем контент
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
              🕒 Время работы: {workingHours}
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
            {categories.map(category => (
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
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = defaultProduct;
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
                      <button
                        className={`add-to-cart-btn ${isRestaurantOwner ? 'disabled' : ''}`}
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0 || isRestaurantOwner}
                        title={isRestaurantOwner ? "Владельцы ресторана не могут добавлять товары в корзину" : ""}
                      >
                        {product.quantity === 0 ? 'Нет в наличии' : 
                         isRestaurantOwner ? 'Ваш продукт' : 'В корзину'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка корзины (только для пользователей) - скрывается когда корзина открыта */}
      {!isRestaurantOwner && cart.length > 0 && !isCartOpen && (
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

      {/* Боковая панель корзины (только для пользователей) */}
      {!isRestaurantOwner && isCartOpen && (
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
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  
                  <span className="cart-item-quantity">{item.quantity}</span>
                  
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      )}

      {/* Затемнение фона когда корзина открыта */}
      {!isRestaurantOwner && isCartOpen && (
        <div 
          className="cart-overlay"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default RestaurantDetail;