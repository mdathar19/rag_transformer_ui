import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
  },
  variants: {
    default: {
      background: 'var(--purple-gradient)',
      color: 'white',
      padding: '0.625rem 1.25rem',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      padding: '0.625rem 1.25rem',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
      padding: '0.625rem 1.25rem',
    },
    link: {
      background: 'transparent',
      color: 'var(--purple-600)',
      padding: '0',
      textDecoration: 'underline',
    },
  },
  sizes: {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.75rem',
    },
    md: {
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
    },
  },
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'md', asChild = false, disabled, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const combinedStyle = {
      ...buttonStyles.base,
      ...buttonStyles.variants[variant],
      ...(size !== 'md' && buttonStyles.sizes[size]),
      ...(disabled && { opacity: '0.5', cursor: 'not-allowed' }),
      ...style,
    };

    return (
      <Comp
        ref={ref}
        style={combinedStyle}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
