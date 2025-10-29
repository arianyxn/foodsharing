import React from 'react';
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

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;