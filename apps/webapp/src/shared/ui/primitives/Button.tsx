import React from 'react';
import { cn } from '../utils/cn.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    border: 'none',
    borderRadius: 'var(--r-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--sp-2)',
    transition: 'opacity 0.2s, background-color 0.2s',
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: {
      padding: 'var(--sp-2) var(--sp-3)',
      fontSize: 'var(--text-sm)',
    },
    md: {
      padding: 'var(--sp-3) var(--sp-4)',
      fontSize: 'var(--text-md)',
    },
    lg: {
      padding: 'var(--sp-4) var(--sp-6)',
      fontSize: 'var(--text-lg)',
    },
  };

  const variantStyles: Record<'primary' | 'secondary' | 'ghost' | 'danger', React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: 'var(--bg)',
    },
    secondary: {
      backgroundColor: 'var(--card)',
      color: 'var(--fg)',
      border: '1px solid var(--border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--fg)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#fff',
    },
  };

  const spinnerStyles: React.CSSProperties = {
    width: '1em',
    height: '1em',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
      <button
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(className)}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...variantStyles[variant],
        }}
        {...props}
      >
        {isLoading && <span style={spinnerStyles} />}
        {!isLoading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    </>
  );
}
