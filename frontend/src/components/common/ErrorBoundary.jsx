import React from 'react';
import logger from '../../lib/logger';
import * as Sentry from '@sentry/react';

/**
 * Catches render-time exceptions anywhere below it. Without this, a single
 * bad render unmounts the whole React tree and the user sees a blank white
 * page with no way forward.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Unhandled UI error:', error, errorInfo);
    // Sentry is initialised only when VITE_SENTRY_DSN is configured; when
    // it is not, this is a cheap no-op and the logger line above remains
    // the record.
    if (Sentry.getClient()) {
      Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            An unexpected error occurred. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Reload SkillSwap
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
