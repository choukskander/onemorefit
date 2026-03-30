
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import Home from './pages/Home';
import About from './pages/About';
import Schedule from './pages/Schedule';
import Reservations from './pages/Reservations';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import { Menu, X, Facebook, Instagram, Twitter, Globe, ShieldAlert } from 'lucide-react';


const Logo = () => (
  <div className="flex items-center space-x-3">
    <div className="w-12 h-12 overflow-hidden rounded-xl border border-zinc-800 shadow-lg">
      <img 
        src="https://res.cloudinary.com/dftgawfdc/image/upload/v1770298291/IMG_20260205_142932_tmmbdl.jpg" 
        alt="One More Fit Logo" 
        className="w-full h-full object-cover scale-110"
      />
    </div>
    <div className="flex flex-col -space-y-1">
      <span className="text-white font-black text-xl brand-font italic tracking-tighter leading-none uppercase">
        ONE MORE <span className="text-yellow-500">+</span>
      </span>
      <span className="text-zinc-500 font-bold text-[9px] uppercase tracking-[0.3em] leading-none">EST. 2026</span>
    </div>
  </div>
);

const Navbar = () => {
  const { language, setLanguage, t, user, setUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'nav_home' },
    { path: '/about', label: 'nav_about' },
    { path: '/schedule', label: 'nav_schedule' },
    { path: '/reservations', label: 'nav_reservations' },
    { path: '/contact', label: 'nav_contact' },
  ];

  // Condition spéciale pour l'admin
  const isAdmin = user?.email === 'admin@gmail.com';

  return (
    <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    location.pathname === link.path ? 'text-yellow-500' : 'text-zinc-300 hover:text-white'
                  } px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors`}
                >
                  {t(link.label)}
                </Link>
              ))}
              
              {/* LIEN ADMIN CONDITIONNEL */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`${
                    location.pathname === '/admin' ? 'bg-yellow-500 text-black' : 'text-yellow-500 border border-yellow-500/30'
                  } ml-4 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2`}
                >
                  <ShieldAlert size={14} />
                  Dashboard Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center space-x-1 text-zinc-400 hover:text-white text-xs uppercase font-bold"
            >
              <Globe size={16} />
              <span>{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-zinc-500 text-[10px] truncate max-w-[100px] font-bold">{user.name || user.email}</span>
                <button 
                  onClick={() => setUser(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/reservations" className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2.5 rounded font-black text-xs uppercase transition-all shadow-lg shadow-yellow-500/10">
                Connexion
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="text-zinc-400 hover:text-white"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-zinc-900 border-b border-zinc-800 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 uppercase tracking-widest"
              >
                {t(link.label)}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm font-black text-yellow-500 hover:bg-yellow-500 hover:text-black uppercase tracking-widest"
              >
                Dashboard Admin
              </Link>
            )}

            {/* LOGOUT / LOGIN MOBILE */}
            <div className="px-3 py-3 border-t border-zinc-800 mt-2">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-400 text-xs font-bold truncate">{user.name || user.email}</span>
                  <button
                    onClick={() => { setUser(null); setIsOpen(false); }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded text-xs uppercase font-black tracking-widest transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  to="/reservations"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded font-black text-xs uppercase tracking-widest transition-all"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  const { t } = useApp();
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <Logo />
            <p className="text-zinc-400 text-sm mt-6 leading-relaxed">{t('hero_subtitle')}</p>
            <div className="flex space-x-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-yellow-500 border border-zinc-800 hover:border-yellow-500 transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-yellow-500 border border-zinc-800 hover:border-yellow-500 transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-yellow-500 border border-zinc-800 hover:border-yellow-500 transition-all"><Twitter size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-6 text-yellow-500">{t('contact_info')}</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-zinc-600">Addr:</span> {t('footer_address')}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-zinc-600">Mail:</span> {t('footer_email')}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-zinc-600">Cell:</span> {t('footer_phone')}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-6 text-yellow-500">Horaires</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li className="flex justify-between border-b border-zinc-900 pb-2">
                <span>Lun - Ven</span> 
                <span className="text-zinc-200">06:00 - 23:00</span>
              </li>
              <li className="flex justify-between border-b border-zinc-900 pb-2">
                <span>Samedi</span> 
                <span className="text-zinc-200">06:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Dimanche</span> 
                <span className="text-zinc-200">07:00 - 15:00</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em]">
          &copy; {new Date().getFullYear()} One More Fit + . Built for excellence.
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
