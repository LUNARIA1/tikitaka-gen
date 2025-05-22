
import React from 'react';

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}

const StyledSelect: React.FC<StyledSelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out bg-white ${props.className}`}
      >
        {children}
      </select>
    </div>
  );
};

export default StyledSelect;
