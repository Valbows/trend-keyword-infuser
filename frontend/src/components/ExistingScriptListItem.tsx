import React from 'react';
import { ScriptSummary } from './ScriptWorkflowOrchestrator'; // Adjust path if ScriptSummary moves

interface ExistingScriptListItemProps {
  script: ScriptSummary;
  onLoadScript: (script: ScriptSummary) => void;
}

const ExistingScriptListItem: React.FC<ExistingScriptListItemProps> = ({ script, onLoadScript }) => {
  return (
    <li className="p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-150 flex justify-between items-center">
      <div>
        <span className="font-medium text-sky-300 block">{script.topic || 'Untitled Script'}</span>
        <span className="text-xs text-slate-400">
          ID: {script.id.substring(0,8)}... | Updated: {new Date(script.updated_at).toLocaleDateString()}
        </span>
      </div>
      <button 
        onClick={() => onLoadScript(script)}
        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
      >
        Load for Editing
      </button>
    </li>
  );
};

export default ExistingScriptListItem;
