// frontend/src/components/ScriptWorkflowOrchestrator.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ScriptEditor from './ScriptEditor'; // Assuming ScriptEditor.tsx is in the same directory

// Define a basic structure for Trend items if they are used for generation
interface TrendItem {
  keyword: string;
  snippet?: string;
  source?: string;
  pubDate?: string;
}

// Interface for the script object expected from the backend (especially for listing)
export interface ScriptSummary {
  id: string;
  topic: string;
  generated_script: string; // Full content for now, might be summary later
  created_at: string;
  updated_at: string;
  // Add other fields if returned by GET /api/v1/scripts and useful for display
}

const ScriptWorkflowOrchestrator: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  // const [trends, setTrends] = useState<TrendItem[]>([]); // If trends are part of input

  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [currentScriptContent, setCurrentScriptContent] = useState<string>('');
  const [currentScriptTopic, setCurrentScriptTopic] = useState<string>('');

  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [isLoadingSave, setIsLoadingSave] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const [existingScripts, setExistingScripts] = useState<ScriptSummary[]>([]);
  const [isLoadingExistingScripts, setIsLoadingExistingScripts] = useState<boolean>(false);
  const [loadExistingScriptsError, setLoadExistingScriptsError] = useState<string | null>(null);

  // Fetch existing scripts on component mount
  useEffect(() => {
    const fetchExistingScripts = async () => {
      setIsLoadingExistingScripts(true);
      setLoadExistingScriptsError(null);
      try {
        const response = await fetch('/api/v1/scripts');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: ScriptSummary[] = await response.json();
        setExistingScripts(data);
      } catch (error: any) {
        console.error('Failed to fetch existing scripts:', error);
        setLoadExistingScriptsError(error.message || 'An unknown error occurred while fetching scripts.');
      } finally {
        setIsLoadingExistingScripts(false);
      }
    };

    fetchExistingScripts();
  }, []);

  const handleLoadScriptForEditing = useCallback((script: ScriptSummary) => {
    setCurrentScriptId(script.id);
    setCurrentScriptContent(script.generated_script);
    setCurrentScriptTopic(script.topic);
    // Clear any previous state related to generation or saving of another script
    setGenerationError(null);
    setSaveError(null);
    setSaveSuccessMessage(null);
    // Scroll to editor or ensure it's visible if necessary (optional UX enhancement)
    // For instance, by focusing the textarea or scrolling the view.
    // const editorElement = document.getElementById('scriptEditorTextArea'); // Assuming ScriptEditor's textarea has such an ID
    // if (editorElement) editorElement.focus();
    console.log(`Loading script ID: ${script.id} for editing.`);
  }, [setCurrentScriptId, setCurrentScriptContent, setCurrentScriptTopic, setGenerationError, setSaveError, setSaveSuccessMessage]);

  const handleGenerateNewScript = useCallback(async () => {
    if (!topic.trim()) {
      setGenerationError('Topic cannot be empty.');
      return;
    }
    setIsLoadingGeneration(true);
    setGenerationError(null);
    setCurrentScriptId(null); // Clear previous script details
    setCurrentScriptContent('');
    setCurrentScriptTopic('');
    setSaveSuccessMessage(null);
    setSaveError(null);

    try {
      const response = await fetch('/api/v1/scripts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic /*, trends */ }), // Add trends if used
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.scriptId && typeof data.script === 'string') {
        setCurrentScriptId(data.scriptId);
        setCurrentScriptContent(data.script);
        setCurrentScriptTopic(data.topic || topic);
      } else {
        throw new Error('Invalid response from script generation: ID or content missing.');
      }
    } catch (error: any) {
      console.error('Failed to generate script:', error);
      setGenerationError(error.message || 'An unknown error occurred during script generation.');
    } finally {
      setIsLoadingGeneration(false);
    }
  }, [topic, setIsLoadingGeneration, setGenerationError, setCurrentScriptId, setCurrentScriptContent, setCurrentScriptTopic, setSaveSuccessMessage, setSaveError]);

  const handleSaveEditedScript = useCallback(async (editedContent: string) => {
    if (!currentScriptId) {
      setSaveError('No script selected or ID missing to save.');
      return;
    }
    setIsLoadingSave(true);
    setSaveError(null);
    setSaveSuccessMessage(null);

    try {
      const response = await fetch(`/api/v1/scripts/${currentScriptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      // Assuming the backend returns the updated script object
      if (data && typeof data.generated_script === 'string') {
        setCurrentScriptContent(data.generated_script); // Update content with response from server (source of truth)
        setSaveSuccessMessage('Script saved successfully!');
      } else {
        // Fallback if response structure is not as expected, but was OK
        setCurrentScriptContent(editedContent);
        setSaveSuccessMessage('Script saved (client-side update). Ensure backend returns full script object for optimal sync.');
      }
      // Auto-clear success message after a few seconds
      setTimeout(() => setSaveSuccessMessage(null), 3000);

    } catch (error: any) {
      console.error('Failed to save script:', error);
      setSaveError(error.message || 'An unknown error occurred while saving the script.');
    } finally {
      setIsLoadingSave(false);
    }
  }, [currentScriptId, setIsLoadingSave, setSaveError, setSaveSuccessMessage, setCurrentScriptContent]);

  console.log('[ScriptWorkflowOrchestrator] DEBUG: ScriptEditor render conditions:', {
    hasContent: !!currentScriptContent,
    hasId: !!currentScriptId,
    shouldRenderEditor: !!(currentScriptContent || currentScriptId),
    currentScriptIdForTitle: currentScriptId,
    isLoadingSaveProp: isLoadingSave, // This is passed to ScriptEditor's isLoading prop
    saveErrorProp: saveError
  });

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-xl shadow-2xl">
      <div className="generation-section space-y-4 bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2">Generate New Script</h2>
        <div>
          <label htmlFor="topicInput" className="block text-sm font-medium text-slate-300 mb-1">Topic:</label>
          <textarea
            id="topicInput"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., Future of AI)"
            rows={3}
            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm text-slate-100 placeholder-slate-400 resize-y"
            disabled={isLoadingGeneration}
          />
        </div>
        {/* Add trends input section here if needed */}
        <button
          onClick={handleGenerateNewScript}
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

      {/* Section to Load Existing Scripts */}
      <div className="existing-scripts-section space-y-4 bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-teal-400 border-b border-slate-700 pb-2">Load Existing Script</h2>
        {isLoadingExistingScripts && <p className="text-slate-400">Loading scripts...</p>}
        {loadExistingScriptsError && (
          <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md">
            Error loading scripts: {loadExistingScriptsError}
          </p>
        )}
        {!isLoadingExistingScripts && !loadExistingScriptsError && existingScripts.length === 0 && (
          <p className="text-slate-400">No existing scripts found.</p>
        )}
        {!isLoadingExistingScripts && !loadExistingScriptsError && existingScripts.length > 0 && (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {existingScripts.map((script) => (
              <li key={script.id} className="p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-150 flex justify-between items-center">
                <div>
                  <span className="font-medium text-sky-300 block">{script.topic || 'Untitled Script'}</span>
                  <span className="text-xs text-slate-400">
                    ID: {script.id.substring(0,8)}... | Updated: {new Date(script.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => handleLoadScriptForEditing(script)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-sm rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  Load for Editing
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {currentScriptId && (
        <ScriptEditor
          initialScriptContent={currentScriptContent}
          onSave={handleSaveEditedScript}
          isLoading={isLoadingSave}
          error={saveError}
          title={currentScriptTopic}
        />
      )}
      {saveSuccessMessage && (
         <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse">
           {saveSuccessMessage}
         </div>
      )}
    </div>
  );
};

export default ScriptWorkflowOrchestrator;
