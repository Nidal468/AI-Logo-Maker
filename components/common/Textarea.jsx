'use client';

import React, { forwardRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

// Textarea component using forwardRef
const Textarea = forwardRef(({
  id,
  label,
  placeholder,
  rows = 4, // Default number of rows
  error,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  disabled = false,
  footerText, // Optional text below (like character count)
  ...props
}, ref) => {

  // Base classes for the textarea
  const baseTextareaClasses = `block w-full rounded-md border shadow-xs transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm py-2 px-3`;

  // Border classes based on error state
  const borderClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-400'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-400';

  // Disabled state classes
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white';

  // Combine textarea classes
  const finalTextareaClasses = `${baseTextareaClasses} ${borderClasses} ${disabledClasses} ${textareaClassName}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className="relative"> {/* Added relative positioning for potential future icons */}
        <textarea
          id={id}
          name={id}
          rows={rows}
          placeholder={placeholder}
          className={finalTextareaClasses}
          disabled={disabled}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
         {/* Optional: Add error icon inside if desired, similar to Input */}
         {/* {error && (
           <div className="pointer-events-none absolute top-2 right-0 flex items-center pr-3">
             <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
           </div>
         )} */}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Footer Text */}
      {footerText && !error && (
         <p className="mt-1.5 text-xs text-gray-500">
           {footerText}
         </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
