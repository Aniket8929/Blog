import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, variant = 'default', size = 'md', children, ...props }) {
  const variants = {
    default: 'bg-primary text-text-primary hover:bg-primary-hover',
    secondary: 'bg-card text-text-primary border border-border hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 text-text-primary',
    danger: 'bg-error text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-4 py-2.5 rounded-lg border border-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-2.5 rounded-lg border border-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-gray-100 text-text-secondary',
    primary: 'bg-primary/20 text-text-primary',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Avatar({ src, alt, fallback, className }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-text-primary font-semibold text-sm',
          className
        )}
      >
        {fallback?.[0]?.toUpperCase() || 'U'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn('rounded-full object-cover', className)}
    />
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />;
}

export function Spinner({ className }) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-primary border-t-transparent', className)} />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const types = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ×
        </button>
      )}
    </div>
  );
}