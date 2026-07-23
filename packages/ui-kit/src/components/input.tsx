import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label?.replace(/\s/g, '-');
    return (
      <label className="flex w-full flex-col gap-2 text-start">
        {label ? (
          <span className="text-sm font-medium text-[var(--sq-text)]">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-12 w-full rounded-[var(--sq-radius-md)] border border-[var(--sq-border)] bg-[var(--sq-surface)] px-4 text-base text-[var(--sq-text)] outline-none transition-shadow placeholder:text-[var(--sq-text-secondary)] focus:border-[var(--sq-primary)] focus:shadow-[0_0_0_3px_var(--sq-primary-muted)]',
            error && 'border-[var(--sq-error)]',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="text-sm text-[var(--sq-error)]">{error}</span>
        ) : hint ? (
          <span className="text-sm text-[var(--sq-text-secondary)]">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = 'Input';
