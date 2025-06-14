import React from 'react';

interface ModifyScriptButtonProps {
  onClick: () => void;
  isLoading: boolean; // Main script generation loading
  isModifying: boolean; // Modification specific loading
  disabled: boolean; // True if button should be fully disabled
  showHint: boolean; // True if the 'select keywords' hint should be shown
}

const ModifyScriptButton: React.FC<ModifyScriptButtonProps> = ({ onClick, isLoading, isModifying, disabled, showHint }) => {
  return (
    <section className="mb-8 text-center">
      <button
        onClick={onClick}
        disabled={isModifying || isLoading || disabled}
        className="btn-action bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500"
      >
        {isModifying ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Modifying...
          </>
        ) : (
          'Modify Script with Selected Keywords'
        )}
      </button>
      {showHint && (
         <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Select keywords from the sidebar to enable modification.</p>
      )}
    </section>
  );
};

export default ModifyScriptButton;
