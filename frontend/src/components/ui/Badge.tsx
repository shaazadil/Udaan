import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'saffron' | 'neutral' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  children,
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }[size];

  const variantStyles = {
    forest: 'bg-forest-surface text-forest border border-forest/20',
    saffron: 'bg-saffron-subtle text-saffron-deep border border-saffron/20',
    neutral: 'bg-ivory-warm text-charcoal border border-neutral-border',
    success: 'bg-status-success-bg text-status-success border border-status-success/20',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning/20',
    error: 'bg-status-error-bg text-status-error border border-status-error/20',
    outline: 'bg-transparent text-neutral-muted border border-neutral-border',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md select-none tracking-tight ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
