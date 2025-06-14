import React from 'react';

interface NewScriptGeneratorProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onGenerateScript: () => void;
  isLoadingGeneration: boolean;
  generationError: string | null;
}

const NewScriptGenerator: React.FC<NewScriptGeneratorProps> = ({
  topic,
  onTopicChange,
  onGenerateScript,
  isLoadingGeneration,
  generationError,
}) => {
  return (
    <div className="generation-section space-y-4 bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2">Generate New Script</h2>
      <div>
        <label htmlFor="topicInputOrchestrator" className="block text-sm font-medium text-slate-300 mb-1">Topic:</label>
        <textarea
          id="topicInputOrchestrator" // Changed ID to avoid conflict if multiple instances
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="Enter a topic (e.g., Future of AI)"
          rows={3}
          className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm text-slate-100 placeholder-slate-400 resize-y"
          disabled={isLoadingGeneration}
        />
      </div>
      <button
        onClick={onGenerateScript}
        disabled={isLoadingGeneration}
        className={`w-full px-6 py-3 rounded-md font-semibold transition-colors duration-150 flex items-center justify-center
          ${isLoadingGeneration
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-sky-600 hover:bg-sky-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800'
          }
        `}
      >
        {isLoadingGeneration ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Script...
          </>
        ) : (
          'Generate Script'
        )}
      </button>
      {generationError && (
        <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">
          Generation Error: {generationError}
        </p>
      )}
    </div>
  );
};

export default NewScriptGenerator;
