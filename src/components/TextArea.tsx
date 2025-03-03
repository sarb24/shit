import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full
          p-3
          border
          border-gray-300
          rounded-md
          bg-gray-50
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-transparent
          resize-none
          transition-all
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 