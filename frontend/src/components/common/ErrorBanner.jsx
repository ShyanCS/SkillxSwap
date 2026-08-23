import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

// Inline, dismissible status banner. This replaces window.alert() feedback:
// alerts block the main thread, cannot be styled, and vanish on the next
// keystroke -- an inline banner keeps the error visible next to the action
// that caused it until the user deals with it.
//
// Renders nothing without a message, so callers can keep it mounted and
// simply clear whatever piece of state feeds it.

const TONES = {
  error: {
    icon: AlertTriangle,
    classes: 'bg-red-50 border-red-200 text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  success: {
    icon: CheckCircle2,
    classes: 'bg-green-50 border-green-200 text-green-800',
  },
};

const ErrorBanner = ({ message, tone = 'error', onDismiss, className = '' }) => {
  if (!message) return null;

  const { icon: Icon, classes } = TONES[tone] || TONES.error;

  return (
    <div
      role="alert"
      data-testid="error-banner"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${classes} ${className}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
