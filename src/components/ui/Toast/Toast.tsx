import React, { useEffect } from 'react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: (
    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const bgColorMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-cyan-50 border-cyan-200',
};

const titleColorMap = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-cyan-800',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div
      className={`flex items-start w-full max-w-sm p-4 mb-3 border rounded-xl shadow-lg ${bgColorMap[type]} animate-slide-in-right`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">{iconMap[type]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${titleColorMap[type]}`}>{title}</p>
        {message && <p className="text-sm mt-0.5 text-slate-600">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 ml-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan rounded"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden">
        <div
          className={`h-full ${type === 'success' ? 'bg-success' : type === 'error' ? 'bg-error' : type === 'warning' ? 'bg-warning' : 'bg-cyan'}`}
          style={{
            width: '100%',
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;