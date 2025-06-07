"use client";

import { useState } from 'react';
import TrendSidebar from '@/components/TrendSidebar'; // Import the new sidebar

export default function Home() {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccessMessage, setCopySuccessMessage] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto w-full bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-10 flex">
        <TrendSidebar />
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400">
              Trend Keyword Infuser
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Generate video scripts powered by the latest trends!
            </p>
          </header>

          <section className="mb-8">
            <label htmlFor="topicInput" className="block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
              Enter Your Video Topic:
            </label>
            <input
              id="topicInput"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Future of Artificial Intelligence'"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150"
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
              disabled={isLoading}
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
      </main>

      <footer className="w-full max-w-3xl mx-auto text-center py-8 mt-12 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Trend Keyword Infuser. Powered by G.O.A.T. C.O.D.E.X. B.O.T.
        </p>
      </footer>
    </div>
  );
}
