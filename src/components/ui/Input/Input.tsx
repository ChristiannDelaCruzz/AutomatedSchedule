import React, { forwardRef, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, iconPosition = 'left', className = '', type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasError = !!error;

    const inputClasses = `
      w-full px-5 py-3.5 bg-white border-2 rounded-xl
      transition-all duration-200 ease-out
      placeholder:text-slate-400 text-slate-900
      focus:outline-none
      ${isFocused ? 'ring-4 ring-cyan/10 border-cyan shadow-sm' : ''}
      ${hasError ? 'border-error ring-1 ring-error/20 focus:ring-error/20 focus:border-error' : 'border-slate-200 hover:border-slate-300'}
      ${icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${isPassword ? 'pr-12' : ''}
      ${className}
    `;

    const iconClasses = `
      absolute top-1/2 -translate-y-1/2
      transition-all duration-200
      ${hasError ? 'text-error' : isFocused ? 'text-cyan' : 'text-slate-400'}
      ${iconPosition === 'left' ? 'left-4' : 'right-4'}
    `;

    return (
      <div className="w-full group">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className={iconClasses}>{icon}</div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {isPassword && (
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
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error animate-fade-in flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;