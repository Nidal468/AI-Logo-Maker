import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'normal',
  shadow = 'md',
  border = false,
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-2',
    normal: 'p-4',
    large: 'p-6',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg',
  };
  
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'transition-all duration-200 hover:shadow-lg' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${hoverClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;