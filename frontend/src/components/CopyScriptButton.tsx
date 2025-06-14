import React from 'react';

interface CopyScriptButtonProps {
  scriptToCopy: string | null;
  onCopy: () => void; // Callback for copy action
  copySuccessMessage: string | null;
}

const CopyScriptButton: React.FC<CopyScriptButtonProps> = ({ scriptToCopy, onCopy, copySuccessMessage }) => {
  if (!scriptToCopy) {
    return null;
  }

  return (
    <div className="mt-4 text-center">
      <button
        onClick={onCopy}
        className="btn-copy bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-500"
        disabled={!scriptToCopy || !!copySuccessMessage} // Disable if no script or if success message is showing (to prevent rapid clicks)
      >
        {copySuccessMessage || 'Copy Script'}
      </button>
    </div>
  );
};

export default CopyScriptButton;
