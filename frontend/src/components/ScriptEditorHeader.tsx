import React from 'react';

interface ScriptEditorHeaderProps {
  title: string;
  isDirty: boolean;
}

const ScriptEditorHeader: React.FC<ScriptEditorHeaderProps> = ({ title, isDirty }) => {
  return (
    <div className="flex items-center border-b border-slate-700 pb-2 mb-4">
      <h3 className="text-xl font-semibold text-sky-400">
        {title}
      </h3>
      {isDirty && <span className="text-yellow-400 ml-2 text-2xl" title="Unsaved changes">*</span>}
    </div>
  );
};

export default ScriptEditorHeader;
