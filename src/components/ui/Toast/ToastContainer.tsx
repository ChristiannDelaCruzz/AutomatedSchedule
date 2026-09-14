import React from 'react';
import { useToast } from '../../../hooks/useToast';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;