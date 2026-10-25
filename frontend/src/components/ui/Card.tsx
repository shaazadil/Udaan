import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'forest';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-neutral-border shadow-subtle',
    elevated: 'bg-white border border-neutral-border shadow-card hover:shadow-elevated transition-shadow duration-200',
    subtle: 'bg-ivory border border-neutral-border/80',
    forest: 'bg-forest-deep text-white border border-forest/30 shadow-card',
  }[variant];

  return (
    <div
      className={`rounded-xl overflow-hidden p-6 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-5 pb-3 border-b border-neutral-border/60 ${className}`}>
    <div>
      <h3 className="font-sans font-semibold text-charcoal text-base tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-neutral-muted mt-0.5 font-normal">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
