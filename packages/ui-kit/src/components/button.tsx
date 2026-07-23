import * as React from 'react';
import { cn } from '../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--sq-primary)] text-[var(--sq-text-inverse)] shadow-[var(--sq-shadow-sm)] hover:bg-[var(--sq-primary-dark)]',
  secondary:
    'bg-[var(--sq-primary-muted)] text-[var(--sq-primary)] hover:opacity-90',
  ghost:
    'bg-transparent text-[var(--sq-primary)] border border-[var(--sq-border)] hover:bg-[var(--sq-primary-muted)]',
  danger: 'bg-[var(--sq-error)] text-white hover:opacity-90',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--sq-radius-lg)] px-5 text-base font-semibold transition-[transform,opacity,background] duration-[var(--sq-duration)] ease-[var(--sq-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sq-primary)] disabled:opacity-40',
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';
