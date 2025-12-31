import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import oasisLogo from '../assets/oasis_logo.png';
import oasisBannerLogo from '../assets/oasis_banner_new.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="group flex items-center">
          <img
            src={oasisBannerLogo}
            alt="Oasis IIT JEE"
            className="h-10 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 rounded-lg shadow-sm group-hover:shadow-md border border-gray-100/30"
          />
        </Link>
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
              className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-bold text-sm uppercase tracking-wider"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all duration-300 text-sm font-black shadow-xl shadow-indigo-100 transform hover:-translate-y-0.5 active:scale-95">
            Student Login
          </Link>
        </div>
        <button
          className="lg:hidden z-50 relative text-gray-900 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
            <span className={`block w-full h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-full h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-full h-0.5 bg-gray-900 rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 lg:hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="flex flex-col h-full justify-center items-center space-y-8 p-8">
          {[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Courses', path: '/courses' },
            { name: 'Faculty', path: '/faculty' },
            { name: 'Results', path: '/results' },
            { name: 'Gallery', path: '/gallery' },
            { name: 'Contact', path: '/contact' },
          ].map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-2xl font-bold text-gray-800 hover:text-indigo-600 transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${idx * 50}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            className={`mt-4 bg-indigo-600 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-xl shadow-indigo-200 transform transition-all duration-300 hover:scale-105 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ transitionDelay: '400ms' }}
            onClick={() => setIsOpen(false)}
          >
            Student Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;