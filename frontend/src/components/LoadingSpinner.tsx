import React from 'react';

interface LoadingSpinnerProps {
  size?: string; // e.g., 'h-12 w-12'
  borderColor?: string; // e.g., 'border-sky-500'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'h-12 w-12',
  borderColor = 'border-sky-500'
}) => {
  return (
    <div 
      className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${borderColor}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
