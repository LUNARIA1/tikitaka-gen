
import React from 'react';

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const StyledInput: React.FC<StyledInputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out ${props.className} ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );
};

export default StyledInput;
