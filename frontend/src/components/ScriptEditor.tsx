// frontend/src/components/ScriptEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ScriptEditorProps {
  initialScriptContent: string;
  onSave: (editedScript: string) => void;
  isLoading?: boolean;
  error?: string | null;
  title?: string; // Optional title for the editor section
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  initialScriptContent,
  onSave,
  isLoading = false,
  error = null,
  title = 'Edit Your Script',
}) => {
  const [editedScript, setEditedScript] = useState<string>(initialScriptContent);

  // Effect to update local state if the initial content prop changes
  useEffect(() => {
    setEditedScript(initialScriptContent);
  }, [initialScriptContent]);

  const handleSave = () => {
    if (!isLoading) {
      onSave(editedScript);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full space-y-4">
      <h3 className="text-xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-4">
        {title}
      </h3>
      <textarea
        value={editedScript}
        onChange={(e) => setEditedScript(e.target.value)}
        placeholder="Your AI-generated script will appear here. You can edit it directly."
        className="w-full h-96 p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 resize-y text-sm leading-relaxed shadow-inner"
        disabled={isLoading}
      />
      {error && (
        <p className="text-sm text-red-400 bg-red-900/30 p-2 rounded-md">
          Error: {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-150 
            ${isLoading
              ? 'bg-slate-500 text-slate-400 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-500 text-white focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800'
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
      </div>
    </div>
  );
};

export default ScriptEditor;
