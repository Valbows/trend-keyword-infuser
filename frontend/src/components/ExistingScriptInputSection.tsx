import React from 'react';

interface ExistingScriptInputSectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

const ExistingScriptInputSection: React.FC<ExistingScriptInputSectionProps> = ({ value, onChange, disabled }) => {
  return (
    <section id="modify-script-section" className="mb-8 w-full max-w-2xl scroll-mt-24">
      <label htmlFor="existingScriptInput" className="block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
        Paste Your Existing Script to Modify (Optional):
      </label>
      <textarea
        id="existingScriptInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your script here..."
        rows={8}
        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150 resize-y"
        disabled={disabled}
      />
    </section>
  );
};

export default ExistingScriptInputSection;
