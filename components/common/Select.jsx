'use client';

import React, { forwardRef } from 'react';
import { FiChevronDown, FiAlertCircle } from 'react-icons/fi'; // ChevronDown for dropdown indicator

// Select component using forwardRef
const Select = forwardRef(({
  id,
  label,
  options = [], // Array of { value: string | number, label: string, disabled?: boolean }
  error,
  className = '',
  labelClassName = '',
  selectClassName = '',
  disabled = false,
  placeholder, // Optional placeholder text (usually the first option)
  ...props // Pass down value, onChange, etc.
}, ref) => {

  // Base classes for the select element wrapper
  const baseSelectClasses = `relative block w-full appearance-none rounded-md border shadow-xs transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm pl-3 pr-10 py-2`; // Added padding for icon

  // Border classes based on error state
  const borderClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-400'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-400';

  // Disabled state classes
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900';

  // Combine select classes
  const finalSelectClasses = `${baseSelectClasses} ${borderClasses} ${disabledClasses} ${selectClassName}`;

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
      <div className="relative rounded-md shadow-xs">
        <select
          id={id}
          name={id}
          className={finalSelectClasses}
          disabled={disabled}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props} // Spread value, onChange, etc.
        >
          {/* Optional Placeholder */}
          {placeholder && (
            <option value="" disabled={props.value !== ''}>
              {placeholder}
            </option>
          )}
          {/* Map through options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <FiChevronDown className="h-5 w-5" aria-hidden="true" />
        </div>
         {/* Optional Error Icon */}
         {/* {error && (
           <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center pr-1"> <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
           </div>
         )} */}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
