import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Restaurants.css';

// Импортируем изображения
import restaurant1 from '../../assets/images/restaurant1.jpg';
import headerImage1 from '../../assets/images/header-food1.jpg';
import headerImage2 from '../../assets/images/header-food2.jpg';

const Restaurants = () => {
  const { users, user: currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [cityFilter, setCityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompaniesFromDB();
    getUserLocation();
  }, [users]);

  // Умное получение местоположения пользователя
  const getUserLocation = () => {
    try {
      // Сначала пробуем получить реальное местоположение
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Реальное местоположение получено:', position.coords);
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              source: 'geolocation'
            });
          },
          (error) => {
            console.log('Геолокация недоступна, используем данные из профиля');
            getLocationFromProfile();
          },
          {
            timeout: 10000,
            enableHighAccuracy: false
          }
        );
      } else {
        getLocationFromProfile();
      }
    } catch (error) {
      console.log('Ошибка геолокации, используем данные из профиля');
      getLocationFromProfile();
    }
  };

  // Получение местоположения из профиля пользователя
  const getLocationFromProfile = () => {
    try {
      if (currentUser && currentUser.coordinates) {
        // Если у пользователя есть координаты в профиле
        console.log('Используем координаты из профиля:', currentUser.coordinates);
        setUserLocation({
          lat: currentUser.coordinates.lat,
          lng: currentUser.coordinates.lng,
          source: 'profile'
        });
      } else {
        // Используем город по умолчанию
        const defaultCity = currentUser?.city || 'Астана';
        const defaultCoords = getCityCoordinates(defaultCity);
        console.log('Используем город по умолчанию:', defaultCity, defaultCoords);
        setUserLocation({
          ...defaultCoords,
          source: 'default_city'
        });
      }
    } catch (error) {
      console.log('Ошибка получения местоположения из профиля, используем Астану');
      setUserLocation({
        lat: 51.137255,
        lng: 71.435313,
        source: 'fallback'
      });
    }
  };

  // Координаты городов по умолчанию
  const getCityCoordinates = (city) => {
    const cityCoordinates = {
      'Астана': { lat: 51.137255, lng: 71.435313 },
      'Алматы': { lat: 43.238949, lng: 76.889709 },
      'Шымкент': { lat: 42.341686, lng: 69.590101 },
      'Караганда': { lat: 49.804836, lng: 73.095901 },
      'Актобе': { lat: 50.283933, lng: 57.166817 }
    };
    return cityCoordinates[city] || cityCoordinates['Астана'];
  };

  // Загрузка компаний из базы данных
  const loadCompaniesFromDB = () => {
    try {
      console.log('=== ЗАГРУЗКА КОМПАНИЙ ===');
      
      let companiesList = [];
      const seenCompanies = new Set();

      if (users && Array.isArray(users)) {
        users.forEach(user => {
          if (user && user.role === 'business' && user.companyName) {
            const companyKey = `${user.id}-${user.companyName}`;
            if (!seenCompanies.has(companyKey)) {
              seenCompanies.add(companyKey);
              
              // Получаем координаты компании
              const companyCoords = getCompanyCoordinates(user);
              
              companiesList.push({
                id: user.id,
                companyName: user.companyName,
                email: user.email,
                phone: user.phone,
                city: user.city || 'Астана',
                avatar: user.avatar,
                rating: user.rating || 4.5,
                coordinates: companyCoords,
                address: user.address // Добавляем адрес если есть
              });
            }
          }
        });
      }

      console.log('Загружено компаний:', companiesList);
      setCompanies(companiesList);
    } catch (error) {
      console.error('Ошибка загрузки компаний:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Получение координат компании
  const getCompanyCoordinates = (company) => {
    try {
      // 1. Если у компании есть точные координаты
      if (company.coordinates && company.coordinates.lat && company.coordinates.lng) {
        console.log('Компания имеет точные координаты:', company.companyName, company.coordinates);
        return company.coordinates;
      }
      
      // 2. Если есть адрес, можно было бы геокодировать, но пока используем город
      if (company.address) {
        console.log('Компания имеет адрес, но нет координат:', company.companyName, company.address);
      }
      
      // 3. Используем координаты города с небольшим случайным смещением
      const cityCoords = getCityCoordinates(company.city || 'Астана');
      const randomOffset = () => (Math.random() - 0.5) * 0.02; // ~2 км разброс
      
      return {
        lat: cityCoords.lat + randomOffset(),
        lng: cityCoords.lng + randomOffset()
      };
    } catch (error) {
      console.log('Ошибка получения координат компании, используем город по умолчанию');
      return getCityCoordinates(company.city || 'Астана');
    }
  };

  // Расчет расстояния в метрах
  const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    try {
      // Проверяем, что координаты в одном городе/регионе
      const distanceThreshold = 500000; // 500 км максимум
      
      const R = 6371000; // Радиус Земли в метрах
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Если расстояние слишком большое, вероятно координаты в разных городах
      if (distance > distanceThreshold) {
        console.log('Расстояние слишком большое, вероятно разные города:', distance);
        return 1000; // Возвращаем 1 км по умолчанию
      }
      
      return Math.max(1, distance);
    } catch (error) {
      console.log('Ошибка расчета расстояния');
      return 500;
    }
  };

  // Расчет времени ходьбы
  const calculateWalkingTime = (distanceMeters) => {
    try {
      const walkingSpeed = 1.4; // м/с (5 км/ч)
      const timeInMinutes = Math.round(distanceMeters / walkingSpeed / 60);
      return Math.max(1, timeInMinutes);
    } catch (error) {
      return 10;
    }
  };

  // Получение данных для отображения
  const getCompanyData = (company) => {
    try {
      if (!userLocation || !company.coordinates) {
        return getFallbackCompanyData(company);
      }

      const distanceMeters = calculateDistanceInMeters(
        userLocation.lat, userLocation.lng,
        company.coordinates.lat, company.coordinates.lng
      );
      
      const walkingTime = calculateWalkingTime(distanceMeters);

      // Форматирование расстояния
      let distanceDisplay;
      if (distanceMeters < 1000) {
        distanceDisplay = `${Math.round(distanceMeters)} м`;
      } else {
        distanceDisplay = `${(distanceMeters / 1000).toFixed(1)} км`;
      }

      // Время доставки
      const deliveryTime = getDeliveryTime(distanceMeters);

      return {
        distance: distanceDisplay,
        walkingTime: walkingTime.toString(),
        deliveryTime,
        distanceMeters
      };
    } catch (error) {
      console.log('Ошибка получения данных компании, используем запасные данные');
      return getFallbackCompanyData(company);
    }
  };

  // Запасные данные для компании
  const getFallbackCompanyData = (company) => {
    const distances = ['350 м', '650 м', '1.2 км', '1.8 км', '2.5 км'];
    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    
    return {
      distance: randomDistance,
      walkingTime: '8',
      deliveryTime: '20-25 минут',
      distanceMeters: 500
    };
  };

  // Время доставки в зависимости от расстояния
  const getDeliveryTime = (distanceMeters) => {
    if (distanceMeters < 500) return '15-20 минут';
    if (distanceMeters < 1000) return '20-25 минут';
    if (distanceMeters < 2000) return '25-30 минут';
    if (distanceMeters < 5000) return '30-40 минут';
    return '40-50 минут';
  };

  // Проверка, является ли компания текущим пользователем
  const isCurrentUserCompany = (company) => {
    if (!currentUser) return false;
    return currentUser.email === company.email || 
           (currentUser.companyName && currentUser.companyName === company.companyName);
  };

  // Открытие маршрута в Яндекс Картах
  const openYandexRoute = (company) => {
    try {
      if (!userLocation || !company.coordinates) {
        // Если нет координат, открываем поиск по названию и городу
        const searchQuery = encodeURIComponent(`${company.companyName} ${company.city}`);
        window.open(`https://yandex.ru/maps/10335/kazakhstan/search/${searchQuery}`, '_blank');
        return;
      }

      // Строим маршрут
      const { lat: userLat, lng: userLng } = userLocation;
      const { lat: companyLat, lng: companyLng } = company.coordinates;

      const yandexUrl = `https://yandex.ru/maps/?rtext=${userLat},${userLng}~${companyLat},${companyLng}&rtt=pd`;
      window.open(yandexUrl, '_blank');
      
    } catch (error) {
      console.error('Ошибка открытия маршрута:', error);
      const searchQuery = encodeURIComponent(`${company.companyName} ${company.city}`);
      window.open(`https://yandex.ru/maps/10335/kazakhstan/search/${searchQuery}`, '_blank');
    }
  };

  // Сортировка компаний
  const getSortedCompanies = () => {
    try {
      let filteredCompanies = companies;

      if (cityFilter !== 'all') {
        filteredCompanies = companies.filter(company => 
          company.city === cityFilter
        );
      }

      if (sortBy === 'rating') {
        return [...filteredCompanies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'distance' && userLocation) {
        return [...filteredCompanies].sort((a, b) => {
          const dataA = getCompanyData(a);
          const dataB = getCompanyData(b);
          return dataA.distanceMeters - dataB.distanceMeters;
        });
      }

      return filteredCompanies;
    } catch (error) {
      return companies;
    }
  };

  // Получение изображения компании
  const getCompanyImage = (company) => {
    try {
      if (company.avatar && typeof company.avatar === 'string' && company.avatar.startsWith('data:image')) {
        return company.avatar;
      }
      return restaurant1;
    } catch (error) {
      return restaurant1;
    }
  };

  const sortedCompanies = getSortedCompanies();

  if (loading) {
    return (
      <section className="restaurants-page">
        <div className="restaurants-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            color: 'white',
            fontSize: '18px'
          }}>
            Определяем местоположение...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="restaurants-page">
      <div className="restaurants-container">
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

        <div className="filters-section">
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">Сортировка</span>
              <select 
                className="filter-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">По расстоянию</option>
                <option value="rating">По рейтингу</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Город</span>
              <select 
                className="filter-select"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="all">Все города</option>
                <option value="Астана">Астана</option>
                <option value="Алматы">Алматы</option>
                <option value="Шымкент">Шымкент</option>
              </select>
            </div>
          </div>
        </div>

        <div className="restaurants-grid">
          {sortedCompanies.length === 0 ? (
            <div className="empty-state">
              <h3>В базе данных пока нет ресторанов</h3>
              <p>Зарегистрируйте свой ресторан в системе!</p>
            </div>
          ) : (
            sortedCompanies.map((company) => {
              const companyData = getCompanyData(company);
              const isOwnCompany = isCurrentUserCompany(company);
              
              return (
                <div key={company.id} className="restaurant-card">
                  <div className="restaurant-image">
                    <img 
                      src={getCompanyImage(company)} 
                      alt={company.companyName} 
                      onError={(e) => {
                        e.target.src = restaurant1;
                      }}
                    />
                    <div className="rating-badge">
                      ⭐ {typeof company.rating === 'number' ? company.rating.toFixed(1) : '4.5'}
                    </div>
                    {isOwnCompany && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        Ваш ресторан
                      </div>
                    )}
                  </div>
                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{company.companyName}</h3>
                    <p className="delivery-time">{companyData.deliveryTime}</p>
                    <div className="restaurant-meta">
                      <div className="distance-info">
                        <div className="distance">{companyData.distance}</div>
                        <div className="walking-time">~{companyData.walkingTime} мин пешком</div>
                      </div>
                      {!isOwnCompany && (
                        <button 
                          className="route-button"
                          onClick={() => openYandexRoute(company)}
                          title="Построить маршрут в Яндекс Картах"
                        >
                          Маршрут
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Restaurants;