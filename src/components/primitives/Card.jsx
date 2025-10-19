import * as React from 'react';

const cardStyles = {
  container: {
    borderRadius: 'var(--border-radius-lg)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
  },
  header: {
    padding: 'var(--spacing-lg)',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0',
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginTop: 'var(--spacing-xs)',
  },
  content: {
    padding: 'var(--spacing-lg)',
  },
  footer: {
    padding: 'var(--spacing-lg)',
    borderTop: '1px solid var(--border-color)',
  },
};

export const Card = React.forwardRef(({ style, children, ...props }, ref) => (
  <div ref={ref} style={{ ...cardStyles.container, ...style }} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef(({ style, children, ...props }, ref) => (
  <div ref={ref} style={{ ...cardStyles.header, ...style }} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ style, children, ...props }, ref) => (
  <h3 ref={ref} style={{ ...cardStyles.title, ...style }} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ style, children, ...props }, ref) => (
  <p ref={ref} style={{ ...cardStyles.description, ...style }} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef(({ style, children, ...props }, ref) => (
  <div ref={ref} style={{ ...cardStyles.content, ...style }} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef(({ style, children, ...props }, ref) => (
  <div ref={ref} style={{ ...cardStyles.footer, ...style }} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
