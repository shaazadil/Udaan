import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-neutral-muted flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white text-charcoal placeholder:text-neutral-muted/70 text-sm rounded-lg border px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest ${
              icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-status-error focus:ring-status-error/30 focus:border-status-error'
                : 'border-neutral-border hover:border-neutral-border-dark'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-status-error mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-neutral-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full bg-white text-charcoal placeholder:text-neutral-muted/70 text-sm rounded-lg border px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest ${
            error
              ? 'border-status-error focus:ring-status-error/30 focus:border-status-error'
              : 'border-neutral-border hover:border-neutral-border-dark'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-error mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-neutral-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
