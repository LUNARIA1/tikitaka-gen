
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Section;
