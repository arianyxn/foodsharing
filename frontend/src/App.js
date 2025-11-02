import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Goal from './components/Goal';
import WhyUs from './components/WhyUs';
import Quotes from './components/Quotes';
import News from './components/News';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Account from './pages/Account/Account';
import BusinessAccount from './pages/BusinessAccount/BusinessAccount'; // Добавляем импорт
import AllNews from './pages/AllNews/AllNews';
import Restaurants from './pages/Restaurants/Restaurants';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Главная страница с навбаром и футером */}
            <Route path="/" element={
              <>
                <Navbar />
                <div id="main">
                  <Hero />
                </div>
                <div id="about">
                  <Goal />
                </div>
                <div id="whyus">
                  <WhyUs />
                </div>
                <Quotes />
                <div id="catalog">
                  <News /> 
                </div>
                <FAQ />
                <Contact />
                <Footer />
              </>
            } />
            
            {/* Страница каталога ресторанов */}
            <Route path="/restaurants" element={
              <>
                <Navbar />
                <Restaurants />
                <Footer />
              </>
            } />
            
            {/* Страница всех новостей */}
            <Route path="/all-news" element={
              <>
                <Navbar />
                <AllNews />
                <Footer />
              </>
            } />
            
            {/* Страница логина БЕЗ навбара и футера */}
            <Route path="/login" element={<Login />} />
            
            {/* Страница регистрации БЕЗ навбара и футера */}
            <Route path="/register" element={<Register />} />
            
            {/* Страница личного кабинета покупателя */}
            <Route path="/account" element={
              <>
                <Navbar />
                <Account />
                <Footer />
              </>
            } />
            
            {/* Страница бизнес-аккаунта */}
            <Route path="/business-account" element={
              <>
                <Navbar />
                <BusinessAccount />
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;