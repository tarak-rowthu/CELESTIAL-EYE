// frontend/components/ui/ErrorAlert.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center gap-4 max-w-md mx-auto my-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-white">System Error</h3>
        <p className="text-sm text-zinc-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 active:scale-95 text-red-300 rounded-lg text-xs font-semibold tracking-wide border border-red-500/30 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
