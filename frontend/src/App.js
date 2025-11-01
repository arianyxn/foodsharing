import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Steps from './components/Steps';
import WhyUs from './components/WhyUs';
import Quotes from './components/Quotes';
import MiniCatalog from './components/MiniCatalog';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Account from './pages/Account/Account';
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
                  <Steps />
                </div>
                <WhyUs />
                <Quotes />
                <div id="catalog">
                  <MiniCatalog />
                </div>
                <FAQ />
                <Contact />
                <Footer />
              </>
            } />
            
            {/* Страница логина БЕЗ навбара и футера */}
            <Route path="/login" element={<Login />} />
            
            {/* Страница регистрации БЕЗ навбара и футера */}
            <Route path="/register" element={<Register />} />
            
            {/* Страница личного кабинета С навбаром и футером */}
            <Route path="/account" element={
              <>
                <Navbar />
                <Account />
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