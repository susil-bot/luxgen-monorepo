import React from 'react';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { TenantTheme } from '../types';

export interface NotFoundProps {
  tenantTheme?: TenantTheme;
  title?: string;
  description?: string;
  showSearch?: boolean;
  showNavigation?: boolean;
  onSearch?: (query: string) => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  searchPlaceholder?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  showIllustration?: boolean;
  customActions?: React.ReactNode;
}

const NotFoundComponent: React.FC<NotFoundProps> = ({
  tenantTheme = defaultTheme,
  title = 'Page Not Found',
  description = 'The page you are looking for does not exist or has been moved.',
  showSearch = true,
  showNavigation = true,
  onSearch,
  onGoHome,
  onGoBack,
  searchPlaceholder = 'Search...',
  className = '',
  variant = 'default',
  showIllustration = true,
  customActions,
}) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const getIllustration = () => {
    if (!showIllustration) return null;

    return (
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* 404 Number */}
          <div className="text-9xl font-bold text-gray-200 select-none">
            404
          </div>
          {/* Illustration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-32 h-32 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const getContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-gray-600 mb-8">{description}</p>
            {showNavigation && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleGoHome}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </button>
              </div>
            )}
          </div>
        );

      case 'detailed':
        return (
          <div className="text-center">
            {getIllustration()}
            <h1 className="text-5xl font-bold text-gray-900 mb-6">{title}</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{description}</p>
            
            {showSearch && (
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex max-w-md mx-auto">
                  <input
                    type="text"
                    name="search"
                    placeholder={searchPlaceholder}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            )}

            {showNavigation && (
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleGoBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ← Go Back
                </button>
                <button
                  onClick={handleGoHome}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🏠 Go Home
                </button>
              </div>
            )}

            {customActions && (
              <div className="mt-8">
                {customActions}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            {getIllustration()}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">{description}</p>
            
            {showSearch && (
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex max-w-sm mx-auto">
                  <input
                    type="text"
                    name="search"
                    placeholder={searchPlaceholder}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            )}

            {showNavigation && (
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleGoBack}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleGoHome}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </button>
              </div>
            )}

            {customActions && (
              <div className="mt-6">
                {customActions}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${className}`}
      style={{
        backgroundColor: tenantTheme.colors.background,
        color: tenantTheme.colors.text,
      }}
    >
      <div className="max-w-2xl w-full">
        {getContent()}
      </div>
    </div>
  );
};

export const NotFound = withSSR(NotFoundComponent);
