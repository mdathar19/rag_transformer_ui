import * as React from 'react';

const inputStyles = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'all 0.2s',
};

export const Input = React.forwardRef(({ className, type, style, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      style={{
        ...inputStyles,
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--purple-500)';
        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';
