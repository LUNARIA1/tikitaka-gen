
import React from 'react';

interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

const StyledTextarea: React.FC<StyledTextareaProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out ${props.className} ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );
};

export default StyledTextarea;
