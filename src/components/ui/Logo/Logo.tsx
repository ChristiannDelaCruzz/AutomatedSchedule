import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'full' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Premium Logo Icon */}
      <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-navy to-navy-dark rounded-xl shadow-md shadow-navy/20">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
        {/* Premium accent dot */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-cyan to-cyan-dark rounded-full border-2 border-white shadow-sm" />
      </div>
      
      {variant === 'full' && (
        <span className="text-xl font-bold text-slate-900 tracking-tight">
          Schedule<span className="text-navy">Pro</span>
        </span>
      )}
    </div>
  );
};

export default Logo;