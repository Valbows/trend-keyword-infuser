import React from 'react';
import { ScriptSummary } from './ScriptWorkflowOrchestrator'; // Adjust path if ScriptSummary moves
import ExistingScriptListItem from './ExistingScriptListItem';

interface ExistingScriptsListProps {
  scripts: ScriptSummary[];
  isLoading: boolean;
  error: string | null;
  onLoadScript: (script: ScriptSummary) => void;
}

const ExistingScriptsList: React.FC<ExistingScriptsListProps> = ({
  scripts,
  isLoading,
  error,
  onLoadScript,
}) => {
  return (
    <div className="existing-scripts-section space-y-4 bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-teal-400 border-b border-slate-700 pb-2">Load Existing Script</h2>
      {isLoading && <p className="text-slate-400">Loading scripts...</p>}
      {error && (
        <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">
          Error loading scripts: {error}
        </p>
      )}
      {!isLoading && !error && scripts.length === 0 && (
        <p className="text-slate-400">No existing scripts found.</p>
      )}
      {!isLoading && !error && scripts.length > 0 && (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {scripts.map((script) => (
            <ExistingScriptListItem 
              key={script.id} 
              script={script} 
              onLoadScript={onLoadScript} 
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExistingScriptsList;
