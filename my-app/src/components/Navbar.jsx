import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon, FiX } from 'react-icons/fi';
import oasisLogo from '../assets/oasis_logo.png';
import oasisBannerLogo from '../assets/oasis_banner_new.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // Adjust scroll threshold as needed
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-screen z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="group flex items-center">
          <img
            src={oasisBannerLogo}
            alt="Oasis IIT JEE"
            className="h-10 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 rounded-lg shadow-sm group-hover:shadow-md border border-gray-100/30 bg-white"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-8 items-center">
          {[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Courses', path: '/courses' },
            { name: 'Faculty', path: '/faculty' },
            { name: 'Results', path: '/results' },
            { name: 'Gallery', path: '/gallery' },
            { name: 'Contact', path: '/contact' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 font-bold text-sm uppercase tracking-wider"
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <FiMoon className="w-5 h-5 text-gray-600" />
            ) : (
              <FiSun className="w-5 h-5 text-yellow-500" />
            )}
          </button>

          <Link to="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all duration-300 text-sm font-black shadow-xl shadow-indigo-100 dark:shadow-none transform hover:-translate-y-0.5 active:scale-95">
            Student Login
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <FiMoon className="w-5 h-5 text-gray-600" />
            ) : (
              <FiSun className="w-5 h-5 text-yellow-500" />
            )}
          </button>

          <button
            className="z-50 relative text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
              <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-gray-900 dark:bg-white rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Side Navigation Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-72 bg-white dark:bg-black z-[70] shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden flex flex-col border-l border-gray-100 dark:border-gray-800`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <span className="text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">Navigation</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Courses', path: '/courses' },
            { name: 'Faculty', path: '/faculty' },
            { name: 'Results', path: '/results' },
            { name: 'Gallery', path: '/gallery' },
            { name: 'Contact', path: '/contact' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm uppercase tracking-wider transition-all"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/login"
              className="block w-full text-center bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
              onClick={() => setIsOpen(false)}
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;