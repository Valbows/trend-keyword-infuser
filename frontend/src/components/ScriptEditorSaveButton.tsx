import React from 'react';

interface ScriptEditorSaveButtonProps {
  onSave: () => void;
  isLoading: boolean;
  isDirty: boolean;
}

const ScriptEditorSaveButton: React.FC<ScriptEditorSaveButtonProps> = ({ onSave, isLoading, isDirty }) => {
  return (
    <button
      onClick={onSave}
      disabled={isLoading || !isDirty}
      className={`px-6 py-2 rounded-md font-medium transition-all duration-150 transform
        ${isLoading
          ? 'bg-slate-500 text-slate-400 cursor-not-allowed'
          : isDirty
            ? 'bg-sky-600 hover:bg-sky-500 text-white focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800 active:scale-95'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
        }
      `}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </div>
      ) : (
        'Save Edits'
      )}
    </button>
  );
};

export default ScriptEditorSaveButton;
