import React from 'react';

interface ErrorDisplayProps {
  message: string | null | undefined;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, title = 'Error' }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md w-full max-w-2xl">
      <p><strong>{title}:</strong> {message}</p>
    </div>
  );
};

export default ErrorDisplay;
