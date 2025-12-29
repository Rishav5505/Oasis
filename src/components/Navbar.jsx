import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-gray-900 flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
            🎓
          </div>
          <span className="tracking-tight">Oasis <span className="text-indigo-600">JEE</span></span>
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
        <button className="lg:hidden text-gray-900 p-2 bg-gray-50 rounded-xl" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 animate-fade-in">
          <div className="px-6 py-6 space-y-4">
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
                className="block text-gray-800 hover:text-indigo-600 transition-colors font-bold text-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/login" className="block bg-indigo-600 text-white px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-all text-center font-black shadow-lg shadow-indigo-100" onClick={() => setIsOpen(false)}>
              Student Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;