
import React from 'react';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const StyledButton: React.FC<StyledButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-2.5 text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-black text-white hover:bg-gray-800 focus:ring-black";
      break;
    case 'secondary':
      variantStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
  }

  return (
    <button
      {...props}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default StyledButton;
