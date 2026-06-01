import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    const baseClasses = 'px-6 py-3 font-medium transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary text-white rounded-full hover:bg-primary-hover hover:shadow-md hover:scale-[1.03] active:scale-[0.98]',
      secondary: 'bg-secondary text-primary rounded-lg hover:opacity-90 hover:shadow-md'
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    return (
      <button ref={ref} className={combinedClasses} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
