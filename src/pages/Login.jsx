import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import oasisLogo from '../assets/oasis_logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5002/api/auth/forgot-password', { email: forgotEmail });
    alert('Reset email sent');
    setShowForgot(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden p-2">
            <img src={oasisLogo} alt="Oasis Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your Oasis Jee Classes account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50"
              required
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-gray-50"
              required
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Sign In
          </button>
        </form>

        <div className="flex justify-between items-center mt-6 text-sm">
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
            Create Account
          </Link>
          <button
            onClick={() => setShowForgot(true)}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-300"
          >
            Forgot Password?
          </button>
        </div>

        {showForgot && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <form onSubmit={handleForgot} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors duration-300"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300"
                >
                  Send Reset Email
                </button>
                <button
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Secure login powered by Oasis Jee Classes</p>
        </div>
      </div>
    </div>
  );
};

export default Login;