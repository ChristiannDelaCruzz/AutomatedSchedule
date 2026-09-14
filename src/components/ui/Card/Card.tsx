import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  hover = false,
}) => {
  const cardClasses = `
    bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden
    ${hover ? 'transition-all duration-300 hover:shadow-md hover:border-gray-300' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">{footer}</div>
      )}
    </div>
  );
};

export default Card;