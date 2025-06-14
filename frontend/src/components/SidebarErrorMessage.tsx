import React from 'react';

interface SidebarErrorMessageProps {
  message: string | null;
}

const SidebarErrorMessage: React.FC<SidebarErrorMessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="my-3 p-3 bg-red-900/40 border border-red-700/50 rounded-md text-red-300 text-sm" role="alert">
      <p><span className="font-semibold">Error:</span> {message}</p>
    </div>
  );
};

export default SidebarErrorMessage;
