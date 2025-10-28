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
      <Hero />
      <Steps />
      <WhyUs />
      <Quotes />
      <MiniCatalog />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;