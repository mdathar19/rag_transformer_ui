import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

const labelStyles = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--spacing-sm)',
  display: 'block',
};

export const Label = React.forwardRef(({ style, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    style={{ ...labelStyles, ...style }}
    {...props}
  />
));

Label.displayName = 'Label';
