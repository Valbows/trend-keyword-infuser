'use client';

import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce'; // G.O.A.T. C.O.D.E.X. B.O.T. - Import useDebounce
import useApiMutation from '@/hooks/useApiMutation'; // G.O.A.T. C.O.D.E.X. B.O.T. - Import useApiMutation
import TrendSidebar from '@/components/TrendSidebar'; // Import the new sidebar
import Link from 'next/link';
import { useSelectedKeywords } from '@/contexts/SelectedKeywordsContext'; // G.O.A.T. C.O.D.E.X. B.O.T. - Import context hook

interface GenerateScriptResponse {
  script: string;
}

export default function Home() {
  const [topic, setTopic] = useState(''); // Default topic for initial load
  const debouncedTopic = useDebounce(topic, 750); // G.O.A.T. C.O.D.E.X. B.O.T. - Debounce topic for API calls
  const [script, setScript] = useState('');
  // const [isLoading, setIsLoading] = useState(false); // G.O.A.T. C.O.D.E.X. B.O.T. - Removed, replaced by isGenerating from useApiMutation
  const [error, setError] = useState('');
  const [copySuccessMessage, setCopySuccessMessage] = useState('');
  const [existingScript, setExistingScript] = useState('');
  

  // G.O.A.T. C.O.D.E.X. B.O.T. - selectedKeywords now comes from context, setSelectedKeywords was passed to TrendSidebar but is no longer needed as context handles updates internally.
  const { selectedKeywords } = useSelectedKeywords();
  // const [isModifying, setIsModifying] = useState(false); // G.O.A.T. C.O.D.E.X. B.O.T. - Removed, replaced by isModifyingScript from useApiMutation
  const [modifyError, setModifyError] = useState('');
  const [scriptDerivedTopic, setScriptDerivedTopic] = useState('');

  // G.O.A.T. C.O.D.E.X. B.O.T. - Setup useApiMutation for script generation
  const {
    mutate: generateScriptMutate,
    isLoading: isGenerating,
    error: generateError,
    data: generateData,
  } = useApiMutation<
    GenerateScriptResponse,
    { topic: string; user_provided_trends: string[] }
  >('/api/scripts/generate');

  const {
    mutate: infuseScriptMutate,
    isLoading: isModifyingScript,
    error: infuseError,
    data: infuseData,
  } = useApiMutation<
    { modifiedScript: string },
    { existingContent: string; keywords: string[] }
  >('/api/scripts/infuse', { method: 'POST' });

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.'); // G.O.A.T. C.O.D.E.X. B.O.T. - Keep client-side validation
      return;
    }
    setError(''); // Clear previous manual error
    setScript(''); // Clear previous script

    try {
      // G.O.A.T. C.O.D.E.X. B.O.T. - Call mutate function from useApiMutation
      await generateScriptMutate({ topic, user_provided_trends: [] });
      // setScript will be handled by useEffect watching generateData
    } catch (_e) {
      // Error is already set by the hook (generateError)
      // console.error is also handled by the hook
      // setError(e.message) // No longer needed here, hook manages error state
    }
  };

  useEffect(() => {
    if (existingScript.trim()) {
      const words = existingScript.trim().split(/\s+/).slice(0, 5).join(' ');
      setScriptDerivedTopic(words);
    } else {
      setScriptDerivedTopic('');
    }
  }, [existingScript]);

  // G.O.A.T. C.O.D.E.X. B.O.T. - Update script state when generateData changes from the hook
  useEffect(() => {
    if (generateData?.script) {
      setScript(generateData.script);
      setError(''); // Clear error on new successful data
    }
  }, [generateData]);

  // G.O.A.T. C.O.D.E.X. B.O.T. - Update main error state when generateError changes from the hook
  useEffect(() => {
    if (generateError) {
      setError(generateError.message);
      setScript(''); // Clear script on error
    }
  }, [generateError]);

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

    // G.O.A.T. C.O.D.E.X. B.O.T. - Effect to handle successful script infusion
  useEffect(() => {
    if (infuseData?.modifiedScript) {
      setScript(infuseData.modifiedScript);
      setModifyError(''); // Clear previous errors
      alert('Script infused with keywords successfully!');
    }
  }, [infuseData]);

  // G.O.A.T. C.O.D.E.X. B.O.T. - Effect to handle errors during script infusion
  useEffect(() => {
    if (infuseError) {
      setModifyError(infuseError.message);
    }
  }, [infuseError]);

  const handleModifyScript = async () => {
    if (!existingScript.trim()) {
      setModifyError('Script content to modify cannot be empty.');
      return;
    }
    if (selectedKeywords.length === 0) {
      setModifyError('Please select at least one keyword to infuse.');
      return;
    }

    // The actual mutation is now handled by the hook and useEffects.
    // We just need to call the mutate function.
    infuseScriptMutate({
      existingContent: existingScript,
      keywords: selectedKeywords, // selectedKeywords is already a string[]
    });
  };

  return (
    <>
      <div className='bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 sm:p-10 flex flex-col md:flex-row gap-6'>
        <TrendSidebar
          // G.O.A.T. C.O.D.E.X. B.O.T. - selectedKeywords and onSelectedKeywordsChange removed, TrendSidebar uses context
          topic={scriptDerivedTopic || debouncedTopic}
        />
        <div className='flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto'>
          <header className='mb-8 text-center'>
            <h1 className='text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400'>
              Trend Keyword Infuser
            </h1>
            <p className='text-slate-600 dark:text-slate-300 mt-2 text-lg'>
              Generate video scripts powered by the latest trends!
            </p>
            <div className='mt-6'>
              <Link
                href='/scripts'
                className='px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg transform hover:scale-105 active:scale-95'
              >
                Manage AI Scripts
              </Link>
            </div>
          </header>

          <section
            id='generate-script-section'
            className='mb-8 w-full max-w-2xl scroll-mt-24'
          >
            <label
              htmlFor='topicInput'
              className='block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2'
            >
              Enter Your Video Topic:
            </label>
            <textarea
              id='topicInput'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Future of Artificial Intelligence'"
              rows={3}
              className='w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150 resize-y'
              disabled={isGenerating} // G.O.A.T. C.O.D.E.X. B.O.T. - Use isGenerating from hook
            />
          </section>

          {error && (
            <div className='mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md'>
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          <section className='mb-8 text-center'>
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating || !topic.trim()} // G.O.A.T. C.O.D.E.X. B.O.T. - Use isGenerating from hook
              className='px-8 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2'
            >
              {isGenerating ? ( // G.O.A.T. C.O.D.E.X. B.O.T. - Use isGenerating from hook
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Script'
              )}
            </button>
          </section>

          {/* Section for Existing Script Input */}
          <section
            id='modify-script-section'
            className='mb-8 w-full max-w-2xl scroll-mt-24'
          >
            <label
              htmlFor='existingScriptInput'
              className='block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2'
            >
              Paste Your Existing Script to Modify (Optional):
            </label>
            <textarea
              id='existingScriptInput'
              value={existingScript}
              onChange={(e) => setExistingScript(e.target.value)}
              placeholder='Paste your script here...'
              rows={8}
              className='w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150'
              disabled={isGenerating || isModifyingScript} // G.O.A.T. C.O.D.E.X. B.O.T. - Use hook's loading states
            />
          </section>

          {/* Section for Modify Script Button - only shown if existingScript has content */}
          {existingScript.trim() && (
            <section className='mb-8 text-center'>
              <button
                onClick={handleModifyScript}
                disabled={
                  // G.O.A.T. C.O.D.E.X. B.O.T. - Use hook's loading states
                  isModifyingScript ||
                  isGenerating ||
                  !existingScript.trim() ||
                  selectedKeywords.length === 0
                }
                className='px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2'
              >
                {isModifyingScript ? ( // G.O.A.T. C.O.D.E.X. B.O.T. - Use isModifyingScript from hook
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Modifying...
                  </>
                ) : (
                  'Modify Script with Selected Keywords'
                )}
              </button>
              {selectedKeywords.length === 0 &&
                existingScript.trim() &&
                !isModifyingScript && ( // G.O.A.T. C.O.D.E.X. B.O.T. - Use isModifyingScript from hook
                  <p className='text-sm text-yellow-600 dark:text-yellow-400 mt-2'>
                    Select keywords from the sidebar to enable modification.
                  </p>
                )}
            </section>
          )}

          {/* Display Modification Error */}
          {modifyError && (
            <div className='mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md w-full max-w-2xl'>
              <p>
                <strong>Modification Error:</strong> {modifyError}
              </p>
            </div>
          )}

          {script && (
            <section className='mt-10 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg shadow'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-semibold text-slate-800 dark:text-slate-100'>
                  Generated Script:
                </h2>
                {script && (
                  <button
                    onClick={handleCopyScript}
                    className='px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors duration-150 disabled:opacity-50'
                    disabled={!script || !!copySuccessMessage}
                  >
                    {copySuccessMessage || 'Copy Script'}
                  </button>
                )}
              </div>
              <pre className='whitespace-pre-wrap text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 p-4 rounded-md shadow-inner overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-500 scrollbar-track-slate-200 dark:scrollbar-track-slate-700'>
                {script}
              </pre>
            </section>
          )}
        </div>
      </div>

      <footer className='text-center py-8 mt-12 border-t border-slate-200 dark:border-slate-700'>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          &copy; {new Date().getFullYear()} Trend Keyword Infuser. Powered By
          Cookin With AI
        </p>
      </footer>
    </>
  );
}
