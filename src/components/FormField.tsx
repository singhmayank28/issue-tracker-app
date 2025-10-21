'use client';

import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'textarea';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    rows?: number;
    disabled?: boolean;
    autoComplete?: string;
    className?: string;
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    maxLength,
    rows = 4,
    disabled = false,
    autoComplete,
    className = '',
}: FormFieldProps) {
    const baseInputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }
    ${className}
  `.trim();

    const inputId = `${name}-input`;

    return (
        <div className="space-y-1">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {type === 'textarea' ? (
                <textarea
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows={rows}
                    disabled={disabled}
                    className={baseInputClasses}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            ) : (
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={baseInputClasses}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            )}

            {error && (
                <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}

            {maxLength && type !== 'password' && (
                <p className="text-xs text-gray-500">
                    {value.length}/{maxLength} characters
                </p>
            )}
        </div>
    );
}

export default FormField;