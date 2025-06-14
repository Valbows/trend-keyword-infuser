import { useState, useCallback } from 'react';

type CopyStatus = 'idle' | 'success' | 'error';

interface UseCopyToClipboardReturn {
  copyStatus: CopyStatus;
  message: string | null;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Custom hook to handle copying text to the clipboard.
 * Manages copy status and provides user feedback messages.
 */
function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    if (!navigator.clipboard) {
      setMessage('Clipboard API not available.');
      setCopyStatus('error');
      setTimeout(() => { setCopyStatus('idle'); setMessage(null); }, 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard!');
      setCopyStatus('success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setMessage('Failed to copy!');
      setCopyStatus('error');
    }

    setTimeout(() => {
      setCopyStatus('idle');
      setMessage(null);
    }, 2000); // Clear status and message after 2 seconds
  }, []);

  return { copyStatus, message, copyToClipboard };
}

export default useCopyToClipboard;
