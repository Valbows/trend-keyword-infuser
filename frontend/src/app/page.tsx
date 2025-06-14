"use client";

import { useState, useEffect } from 'react';
import TrendSidebar from '@/components/TrendSidebar'; // Import the new sidebar
import Link from 'next/link';

export default function Home() {
  const [topic, setTopic] = useState(''); // Default topic for initial load
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccessMessage, setCopySuccessMessage] = useState('');
  const [existingScript, setExistingScript] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isModifying, setIsModifying] = useState(false);
  const [modifyError, setModifyError] = useState('');
  const [scriptDerivedTopic, setScriptDerivedTopic] = useState('');

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError('');
    setScript('');

    try {
      const response = await fetch('/api/v1/scripts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, user_provided_trends: [] }), // Sending empty array for user_provided_trends for now
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScript(data.script);
    } catch (e: any) {
      console.error('Failed to generate script:', e);
      setError(e.message || 'Failed to generate script. Please try again.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (existingScript.trim()) {
      const words = existingScript.trim().split(/\s+/).slice(0, 5).join(' ');
      setScriptDerivedTopic(words);
    } else {
      setScriptDerivedTopic('');
    }
  }, [existingScript]);

  const handleCopyScript = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopySuccessMessage('Copied to clipboard!');
      setTimeout(() => setCopySuccessMessage(''), 2000); // Clear message after 2 seconds
    } catch (err) {
      console.error('Failed to copy script: ', err);
      setCopySuccessMessage('Failed to copy!');
      setTimeout(() => setCopySuccessMessage(''), 2000);
    }
  };

  const handleModifyScript = async () => {
    if (!existingScript.trim() || selectedKeywords.length === 0) {
      setModifyError('Please provide a script and select at least one keyword.');
      return;
    }
    setIsModifying(true);
    setModifyError('');
    // setScript(''); // Optional: Clear main script display or decide how to update

    try {
      const response = await fetch('/api/v1/scripts/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ existingScript, selectedKeywords }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If parsing JSON fails, use a generic error based on status
          console.error('Failed to parse error JSON from server:', parseError);
          throw new Error(`HTTP error! status: ${response.status}. Unable to parse error details.`);
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScript(data.modifiedScript); // Update the main script display area
      // Optionally, you could also clear existingScript or selectedKeywords here if desired
      // setExistingScript(''); 
      // setSelectedKeywords([]);

    } catch (e: any) {
      console.error('Failed to modify script:', e);
      setModifyError(e.message || 'Failed to modify script. Please try again.');
      // Optionally clear the main script display on error, or leave it as is
      // setScript(''); 
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-10 flex flex-col md:flex-row gap-6">
        <TrendSidebar selectedKeywords={selectedKeywords} onSelectedKeywordsChange={setSelectedKeywords} topic={scriptDerivedTopic || topic} />
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400">
              Trend Keyword Infuser
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Generate video scripts powered by the latest trends!
            </p>
            <div className="mt-6">
              <Link href="/scripts"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg transform hover:scale-105 active:scale-95">
                Manage AI Scripts
              </Link>
            </div>
          </header>

          <section id="generate-script-section" className="mb-8 w-full max-w-2xl scroll-mt-24">
            <label htmlFor="topicInput" className="block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
              Enter Your Video Topic:
            </label>
            <textarea
              id="topicInput"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Future of Artificial Intelligence'"
              rows={3}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150 resize-y"
              disabled={isLoading}
            />
          </section>

          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          <section className="mb-8 text-center">
            <button
              onClick={handleGenerateScript}
              disabled={isLoading || !topic.trim()}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
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

          {/* Section for Existing Script Input */}
          <section id="modify-script-section" className="mb-8 w-full max-w-2xl scroll-mt-24">
            <label htmlFor="existingScriptInput" className="block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
              Paste Your Existing Script to Modify (Optional):
            </label>
            <textarea
              id="existingScriptInput"
              value={existingScript}
              onChange={(e) => setExistingScript(e.target.value)}
              placeholder="Paste your script here..."
              rows={8}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150"
              disabled={isLoading || isModifying}
            />
          </section>

          {/* Section for Modify Script Button - only shown if existingScript has content */}
          {existingScript.trim() && (
            <section className="mb-8 text-center">
              <button
                onClick={handleModifyScript}
                disabled={isModifying || isLoading || !existingScript.trim() || selectedKeywords.length === 0}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                {isModifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Modifying...
                  </>
                ) : (
                  'Modify Script with Selected Keywords'
                )}
              </button>
              {selectedKeywords.length === 0 && existingScript.trim() && !isModifying && (
                 <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Select keywords from the sidebar to enable modification.</p>
              )}
            </section>
          )}

          {/* Display Modification Error */}
          {modifyError && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md w-full max-w-2xl">
                <p><strong>Modification Error:</strong> {modifyError}</p>
              </div>
          )}

          {script && (
            <section className="mt-10 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                  Generated Script:
                </h2>
                {script && (
                  <button
                    onClick={handleCopyScript}
                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors duration-150 disabled:opacity-50"
                    disabled={!script || !!copySuccessMessage}
                  >
                    {copySuccessMessage || 'Copy Script'}
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 p-4 rounded-md shadow-inner overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-200 dark:scrollbar-track-slate-700">
                {script}
              </pre>
            </section>
          )}
        </div>
      </div>

      <footer className="text-center py-8 mt-12 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Trend Keyword Infuser. Powered By Cookin With AI
        </p>
      </footer>
    </>
  );
}
