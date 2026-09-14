// src/pages/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Logo } from '../../components/ui/Logo/Logo';
import { ProductPreview } from './components/ProductPreview';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email || email.trim() === '') {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(email, password);
      
      showToast(
        'success',
        'Sign in successful',
        'Welcome back. Your schedule is ready.'
      );
      
      navigate('/dashboard');
    } catch (error: any) {
      // Determine the error message
      let errorMessage = 'Please check your email and password.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error codes
      if (error.code === 'AUTHENTICATION_ERROR' || error.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'NOT_FOUND' || error.status === 404) {
        errorMessage = 'Account not found. Please check your email.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else if (error.message?.includes('inactive')) {
        errorMessage = 'Your account is inactive. Please contact the administrator.';
      }
      
      showToast(
        'error',
        'Unable to sign in',
        errorMessage
      );
      
      // Clear password on error for security
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "Enter" key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e);
    }
  };

  // Navigate to enrollment form
  const handleCreateAccount = () => {
    navigate('/enrollment');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-navy border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full px-6 sm:px-8 lg:px-16 xl:px-24 py-4 flex items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">New here?</span>
          <button
            type="button"
            onClick={handleCreateAccount}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-navy to-navy-dark rounded-xl hover:shadow-lg hover:shadow-navy/20 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2"
          >
            Create account
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-16 xl:px-24 py-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-28 items-center">
          
          {/* Left - Product Preview */}
          <div className="hidden lg:block">
            <ProductPreview />
          </div>

          {/* Right - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto animate-fade-in">
            {/* Header */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-lighter border border-cyan/20 text-cyan-dark text-xs font-semibold rounded-full mb-5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                WORKSPACE ACCESS
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                Sign in to continue managing your schedule.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
              <Input
                label={
                  <span>
                    Email address
                    <span className="ml-1 text-transparent bg-gradient-to-r from-error to-rose-500 bg-clip-text font-bold">*</span>
                  </span>
                }
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateForm()}
                error={errors.email}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
                autoComplete="email"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              {/* Password Input with Show/Hide Toggle */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                  <span className="ml-1 text-transparent bg-gradient-to-r from-error to-rose-500 bg-clip-text font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => validateForm()}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className={`w-full px-5 py-3.5 bg-white border-2 rounded-xl transition-all duration-200 ease-out placeholder:text-slate-400 text-slate-900 focus:outline-none ${
                      errors.password
                        ? 'border-error ring-1 ring-error/20 focus:ring-error/20 focus:border-error'
                        : 'border-slate-200 hover:border-slate-300 focus:ring-4 focus:ring-cyan/10 focus:border-cyan'
                    } pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-error animate-fade-in flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Form Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-navy focus:ring-cyan focus:ring-offset-0 transition-all duration-200"
                    />
                  </div>
                  <span className="group-hover:text-slate-800 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-navy hover:text-cyan font-medium transition-all duration-200 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-cyan rounded"
                  onClick={() => showToast('info', 'Password reset', 'Password reset functionality will be available soon.')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="group bg-gradient-to-r from-navy to-navy-dark hover:from-navy-dark hover:to-navy shadow-md hover:shadow-xl hover:shadow-navy/20 transition-all duration-300 rounded-xl py-3.5 text-base font-semibold"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
              </div>

              {/* Create Account Link */}
              <div className="text-center pt-4 pb-2">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="text-navy hover:text-cyan font-semibold transition-all duration-200 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-cyan rounded"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;