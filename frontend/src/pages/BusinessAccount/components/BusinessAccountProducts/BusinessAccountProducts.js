import React, { useState, useEffect, useRef } from 'react';
import './BusinessAccountProducts.css';

const BusinessAccountProducts = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const fileInputRef = useRef(null);

  // Данные нового продукта
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: '',
    quantity: '',
    image: null,
    status: 'active'
  });

  // Категории продуктов
  const categories = ['Пицца', 'Бургеры', 'Салаты', 'Напитки', 'Десерты', 'Супы', 'Завтраки', 'Гарниры'];

  // Загрузка продуктов из localStorage
  useEffect(() => {
    if (user) {
      const savedProducts = JSON.parse(localStorage.getItem(`products_${user.id}`)) || [];
      setProducts(savedProducts);
    }
  }, [user]);

  // Сохранение продуктов в localStorage
  const saveProducts = (productsList) => {
    if (user) {
      localStorage.setItem(`products_${user.id}`, JSON.stringify(productsList));
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик загрузки изображения
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Размер файла не должен превышать 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewProduct(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setNewProduct({
      name: '',
      price: '',
      category: '',
      ingredients: '',
      quantity: '',
      image: null,
      status: 'active'
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Добавление нового продукта
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Пожалуйста, заполните обязательные поля: название, цена и категория');
      return;
    }

    const product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: newProduct.name,
      price: parseInt(newProduct.price),
      category: newProduct.category,
      ingredients: newProduct.ingredients,
      quantity: parseInt(newProduct.quantity) || 0,
      image: newProduct.image,
      status: newProduct.status,
      createdAt: new Date().toISOString()
    };

    let updatedProducts;
    if (editingProduct) {
      // Редактирование существующего продукта
      updatedProducts = products.map(p => p.id === editingProduct.id ? product : p);
    } else {
      // Добавление нового продукта
      updatedProducts = [...products, product];
    }

    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    resetForm();
  };

  // Редактирование продукта
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      ingredients: product.ingredients || '',
      quantity: product.quantity?.toString() || '',
      image: product.image,
      status: product.status
    });
    setShowAddForm(true);
  };

  // Удаление продукта
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
    }
  };

  // Изменение статуса продукта
  const handleToggleStatus = (productId) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  return (
    <div className="business-account-section">
      <div className="section-header">
        <h2 className="section-title">Мои продукты</h2>
        {/* Кнопка скрыта, так как теперь есть фиксированная карточка */}
      </div>
      
      <div className="products-stats">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Всего продуктов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter(p => p.status === 'active').length}</div>
          <div className="stat-label">Активные</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter(p => p.status === 'inactive').length}</div>
          <div className="stat-label">Неактивные</div>
        </div>
      </div>

      {/* Форма добавления/редактирования продукта */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h3>{editingProduct ? 'Редактировать продукт' : 'Добавить новый продукт'}</h3>
              <button className="close-form" onClick={resetForm}>×</button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Фото продукта</label>
                <div 
                  className="image-upload-container"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newProduct.image ? (
                    <img src={newProduct.image} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="image-placeholder">
                      <span>+</span>
                      <p>Добавить фото</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Название продукта *</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Введите название продукта"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Цена (₸) *</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Введите цену"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Категория *</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="form-input select-input"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Ингредиенты</label>
                <textarea
                  name="ingredients"
                  value={newProduct.ingredients}
                  onChange={handleInputChange}
                  className="form-input textarea"
                  placeholder="Опишите ингредиенты продукта..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Количество в наличии</label>
                <input
                  type="number"
                  name="quantity"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Количество"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Статус</label>
                <select
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                  className="form-input select-input"
                >
                  <option value="active">Активный</option>
                  <option value="inactive">Неактивный</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={resetForm}>
                Отмена
              </button>
              <button className="save-btn" onClick={handleAddProduct}>
                {editingProduct ? 'Сохранить изменения' : 'Добавить продукт'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="products-grid">
        {/* Фиксированная карточка добавления - ВСЕГДА ПЕРВАЯ */}
        <div className="add-product-card-fixed">
          <button 
            className="add-product-btn-fixed"
            onClick={() => setShowAddForm(true)}
          >
            <span className="add-icon-fixed">+</span>
            <span>Добавить новый продукт</span>
          </button>
        </div>
        
        {/* Список продуктов */}
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-image-preview" />
                ) : (
                  <span className="product-emoji">🍽️</span>
                )}
              </div>
              <div className="product-actions">
                <button 
                  className="action-btn edit" 
                  title="Редактировать"
                  onClick={() => handleEditProduct(product)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="action-btn delete" 
                  title="Удалить"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category}</p>
              {product.ingredients && (
                <p className="product-ingredients">{product.ingredients}</p>
              )}
              <div className="product-details">
                <p className="product-price">{product.price.toLocaleString()} ₸</p>
                <p className="product-quantity">В наличии: {product.quantity || 0}</p>
              </div>
              <div className="product-footer">
                <span className={`product-status ${product.status}`}>
                  {product.status === 'active' ? 'Активный' : 'Неактивный'}
                </span>
                <button 
                  className={`status-toggle ${product.status}`}
                  onClick={() => handleToggleStatus(product.id)}
                >
                  {product.status === 'active' ? 'Деактивировать' : 'Активировать'}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Состояние когда продуктов нет */}
        {products.length === 0 && !showAddForm && (
          <div className="empty-products">
            <div className="empty-icon">🍽️</div>
            <h3>Продуктов пока нет</h3>
            <p>Нажмите на кнопку выше чтобы добавить первый продукт</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAccountProducts;