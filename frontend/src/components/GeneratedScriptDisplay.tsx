import React from 'react';

interface GeneratedScriptDisplayProps {
  script: string | null;
  isLoading: boolean;
  isModifying: boolean;
}

const GeneratedScriptDisplay: React.FC<GeneratedScriptDisplayProps> = ({ script, isLoading, isModifying }) => {
  if (isLoading || isModifying) {
    return (
      <div className="mt-8 w-full max-w-2xl p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Generated Script</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!script) {
    return null;
  }

  return (
    <section id="script-output-section" className="mt-8 w-full max-w-2xl scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Generated Script:
      </h2>
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-lg">
        <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-mono">
          {script}
        </pre>
      </div>
    </section>
  );
};

export default GeneratedScriptDisplay;
