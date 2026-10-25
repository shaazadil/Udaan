import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-neutral-border bg-ivory/60 my-4 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-forest-surface text-forest flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-charcoal">{title}</h4>
      <p className="text-xs text-neutral-muted max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-neutral-border/60 rounded ${className}`} />
);
