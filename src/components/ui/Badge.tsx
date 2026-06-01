import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = 'bg-secondary text-white text-xs font-medium rounded-full px-3 py-1';
    const combinedClasses = `${baseClasses} ${className}`.trim();

    return (
      <span ref={ref} className={combinedClasses} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
