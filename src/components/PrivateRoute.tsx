import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseUser } from '../hooks/useSupabaseUser';
import { ErrorBoundary } from './ErrorBoundary';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, error } = useSupabaseUser();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <a
            href="/auth"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};