import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import backendAPI from '../services/backendApi';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Country codes list (sorted alphabetically by country name)
  const countryCodes = [
    { code: '+355', country: 'Albania', flag: '🇦🇱' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+298', country: 'Faroe Islands', flag: '🇫🇴' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+299', country: 'Greenland', flag: '🇬🇱' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+850', country: 'North Korea', flag: '🇰🇵' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+7', country: 'Russia/Kazakhstan', flag: '🇷🇺' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+383', country: 'Kosovo', flag: '🇽🇰' },
    { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  ].sort((a, b) => a.country.localeCompare(b.country));

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91', // Default to India
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.body.classList.add('dark');
    return () => {
      document.body.classList.remove('dark');
    };
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.phoneNumber || !signupData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Combine country code with phone number (ensure no spaces)
    const fullPhoneNumber = `${signupData.countryCode}${signupData.phoneNumber}`.replace(/\s/g, '');
    
    console.log('Sending registration data:', {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      phoneNumber: fullPhoneNumber,
      passwordLength: signupData.password.length
    });

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await backendAPI.register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        phoneNumber: fullPhoneNumber,
        password: signupData.password
      });

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        navigate('/upload');
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Try to extract more detailed error message
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginData.email || !loginData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await backendAPI.login({
        email: loginData.email,
        password: loginData.password
      });

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        navigate('/upload');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: 0 }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 via-blue-500/20 to-green-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          {/* Swirling patterns */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Glass Card Form */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 backdrop-blur-sm">
                {error}
              </div>
            )}

            {!isSignUp ? (
              // Login Form
              <>
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-2">Login</h2>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  {/* Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-email" className="text-white text-sm font-medium">Email</label>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="border-b border-white/30 pb-1">
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="text-white text-sm font-medium">Password</label>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="border-b border-white/30 pb-1 flex items-center">
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="ml-2 text-white/70 hover:text-white transition-colors"
                      >
                        {showLoginPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me and Forgot password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-white text-sm cursor-pointer">
                      <input type="checkbox" className="mr-2 w-4 h-4 rounded border-white/30 bg-transparent text-white focus:ring-white/50" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-white text-sm hover:underline">Forgot Password?</a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <p className="text-center text-white text-sm mt-6">
                  Don't have an account?{' '}
                  <button onClick={() => setIsSignUp(true)} className="font-semibold text-purple-300 hover:text-purple-200 underline">
                    Register
                  </button>
                </p>
              </>
            ) : (
            // Sign Up Form
            <>
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Register</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSignup}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="firstName" className="text-white text-sm font-medium">First Name</label>
                    </div>
                    <div className="border-b border-white/30 pb-1">
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                        className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="lastName" className="text-white text-sm font-medium">Last Name</label>
                    </div>
                    <div className="border-b border-white/30 pb-1">
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                        className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="signup-email" className="text-white text-sm font-medium">Email</label>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="border-b border-white/30 pb-1">
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="phoneNumber" className="text-white text-sm font-medium">Phone Number</label>
                  </div>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap border-b border-white/30 pb-1">
                    <select
                      id="countryCode"
                      value={signupData.countryCode}
                      onChange={(e) => setSignupData({...signupData, countryCode: e.target.value})}
                      className="flex-shrink-0 bg-transparent text-white text-sm focus:outline-none cursor-pointer border-none"
                      style={{ minWidth: '140px', maxWidth: '160px' }}
                    >
                      {countryCodes.map((country, index) => (
                        <option key={`${country.code}-${index}`} value={country.code} className="bg-gray-900">
                          {country.flag} {country.country} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={signupData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setSignupData({...signupData, phoneNumber: value});
                      }}
                      className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none border-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="signup-password" className="text-white text-sm font-medium">Password</label>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="border-b border-white/30 pb-1 flex items-center">
                    <input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="ml-2 text-white/70 hover:text-white transition-colors"
                    >
                      {showSignupPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="confirm-password" className="text-white text-sm font-medium">Confirm Password</label>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="border-b border-white/30 pb-1 flex items-center">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2 text-white/70 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <label className="flex items-center text-white text-sm cursor-pointer">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="mr-2 w-4 h-4 rounded border-white/30 bg-transparent text-white focus:ring-white/50"
                    />
                    <span>
                      I agree to the{' '}
                      <a href="#" className="text-purple-300 hover:text-purple-200 underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-purple-300 hover:text-purple-200 underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <p className="text-center text-white text-sm mt-6">
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="font-semibold text-purple-300 hover:text-purple-200 underline">
                  Login
                </button>
              </p>
            </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
