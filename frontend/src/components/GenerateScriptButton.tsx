import React from 'react';

interface GenerateScriptButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const GenerateScriptButton: React.FC<GenerateScriptButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <section className="mb-8 text-center">
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className="btn-action bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 focus:ring-sky-500"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Script'
        )}
      </button>
    </section>
  );
};

export default GenerateScriptButton;
