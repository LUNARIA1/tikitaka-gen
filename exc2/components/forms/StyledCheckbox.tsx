
import React from 'react';

interface StyledCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const StyledCheckbox: React.FC<StyledCheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        {...props}
        className={`h-4 w-4 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0 focus:ring-2 transition duration-150 ease-in-out ${props.className}`}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-800">
        {label}
      </label>
    </div>
  );
};

export default StyledCheckbox;
