// frontend/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent animate-spin rounded-full`}
        style={{ borderTopColor: 'transparent' }}
      />
      {label && <p className="text-sm text-zinc-400 animate-pulse">{label}</p>}
    </div>
  );
}
