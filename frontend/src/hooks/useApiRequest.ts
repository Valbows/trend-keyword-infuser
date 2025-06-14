import { useState, useCallback } from 'react';

interface ApiRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage the state of an API request (loading, data, error).
 * @param apiCallFunction A function that performs the API call and returns a Promise.
 * @param initialData Optional initial data.
 * @returns An object containing data, isLoading, error, and an execute function to trigger the API call.
 */
function useApiRequest<T, Args extends any[] = any[]>(
  apiCallFunction: (...args: Args) => Promise<T>,
  initialData: T | null = null
) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (...args: Args) => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      const responseData = await apiCallFunction(...args);
      setState(prevState => ({ ...prevState, data: responseData, isLoading: false }));
      return responseData; // Optionally return data for immediate use
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred';
      setState(prevState => ({ ...prevState, error: errorMessage, isLoading: false, data: initialData })); // Reset data on error
      throw err; // Re-throw to allow caller to handle if needed
    }
  }, [apiCallFunction, initialData]);

  return { ...state, execute };
}

export default useApiRequest;
