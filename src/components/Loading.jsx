/**
 * Loading Component - Simple spinner with animation
 */

export function Loading({ size = 'md', fullScreen = false, message = 'Loading...' }) {
  // Size variants
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-[5px]'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Simple Circular Spinner */}
      <div className={`${sizes[size]} ${borderSizes[size]} border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin`}></div>

      {/* Loading text */}
      {message && (
        <p className={`${textSizes[size]} font-medium text-gray-700 dark:text-gray-300`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingContent />
    </div>
  );
}

/**
 * Inline Loading Spinner - For buttons and small spaces
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const spinnerSizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-2',
    xl: 'w-8 h-8 border-[3px]'
  };

  return (
    <div className={`${spinnerSizes[size]} border-gray-200 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin ${className}`}></div>
  );
}

/**
 * Page Loading - For lazy loaded pages
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loading size="lg" message="Loading page..." />
    </div>
  );
}

/**
 * Card Loading - For loading cards/sections
 */
export function CardLoading({ message = 'Loading...' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
      <Loading size="md" message={message} />
    </div>
  );
}
