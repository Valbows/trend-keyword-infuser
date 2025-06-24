import { useState, useCallback } from 'react';

interface UseApiMutationOptions {
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

interface ApiMutationState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * G.O.A.T. C.O.D.E.X. B.O.T. presents: useApiMutation
 * A hook for performing API mutations (POST, PUT, DELETE, PATCH).
 * It 'Optimizes' API call logic, provides 'Durable' state management,
 * and offers an 'Elegant' interface for components.
 *
 * @template TData - The expected type of the response data.
 * @template TVariables - The type of the variables (e.g., request body) passed to the mutate function.
 * @param url - The API endpoint URL.
 * @param options - Optional configuration for the mutation, like the HTTP method.
 * @returns An object containing the mutate function, data, isLoading state, and error state.
 */
function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseApiMutationOptions
) {
  const [state, setState] = useState<ApiMutationState<TData>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables?: TVariables) => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      try {
        const response = await fetch(url, {
          method: options?.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add other common headers if needed
          },
          body: variables ? JSON.stringify(variables) : null,
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If parsing JSON fails, use a generic error based on status
            console.error(
              'Failed to parse error JSON from server:',
              parseError
            );
            throw new Error(
              `HTTP error! status: ${response.status}. Unable to parse error details.`
            );
          }
          // Prefer error message from backend if available
          const errorMessage =
            errorData?.error ||
            errorData?.message ||
            `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        setState({ data: responseData, isLoading: false, error: null });
        return responseData; // Return data for immediate use if needed
      } catch (err: unknown) {
        let caughtError: Error;
        if (err instanceof Error) {
          caughtError = err;
        } else if (typeof err === 'string') {
          caughtError = new Error(err);
        } else {
          caughtError = new Error(
            'An unknown error occurred during API mutation.'
          );
        }
        console.error(
          `API Mutation Error (${options?.method || 'POST'} ${url}):`,
          caughtError
        );
        setState({ data: null, isLoading: false, error: caughtError });
        throw caughtError; // Re-throw for component-level handling if needed
      }
    },
    [url, options?.method] // Ensure options.method is stable or memoized if passed from parent
  );

  return { mutate, ...state };
}

export default useApiMutation;
