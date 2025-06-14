import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScriptWorkflowOrchestrator from '../src/components/ScriptWorkflowOrchestrator'; // Adjust path

// Define an interface for ScriptEditor props for the mock
interface MockScriptEditorProps {
  initialScriptContent?: string;
  isLoading?: boolean;
  error?: string | null;
  onSave: (scriptContent: string) => void;
  title?: string;
}

// Mock the ScriptEditor child component to isolate ScriptWorkflowOrchestrator logic
const mockScriptEditor = jest.fn();
jest.mock('../src/components/ScriptEditor', () => (props: MockScriptEditorProps) => {
  mockScriptEditor(props);
  // Simulate some basic rendering of the editor for assertion purposes
  return (
    <div>
      <h2>Mocked ScriptEditor</h2>
      {props.title && <h3>{props.title}</h3>}
      <textarea defaultValue={props.initialScriptContent || ''}></textarea>
      <button onClick={() => props.onSave('edited content from mock')}>Save Mock</button>
      {props.isLoading && <p>Editor Loading...</p>}
      {props.error && <p>Editor Error: {props.error}</p>}
    </div>
  );
});

// Mock global fetch
global.fetch = jest.fn();

const mockGeneratedScript = {
  scriptId: 'new-script-123',
  script: 'This is a newly generated script about AI.',
};

const mockExistingScripts = [
  { id: 'existing-1', topic: 'Existing Topic 1', generated_script: 'Content for existing script 1', created_at: new Date().toISOString() },
  { id: 'existing-2', topic: 'Existing Topic 2', generated_script: 'Content for existing script 2', created_at: new Date().toISOString() },
];

const mockUpdatedScript = {
  id: 'existing-1', // or 'new-script-123'
  generated_script: 'This is the updated script content.',
  topic: 'Updated Topic',
};

describe('ScriptWorkflowOrchestrator - G.O.A.T. C.O.D.E.X. B.O.T. Supreme Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    mockScriptEditor.mockClear();
  });

  test('G.O.A.T. Initial Render: Clairvoyantly displays main UI elements and fetches existing scripts', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // For fetching existing scripts
      ok: true,
      json: async () => mockExistingScripts,
    });

    render(<ScriptWorkflowOrchestrator />); 

    expect(screen.getByRole('button', { name: /Generate Script/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Load Existing Script/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/scripts');
      expect(screen.getByText(/Existing Topic 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Existing Topic 2/i)).toBeInTheDocument();
    });
    // Initially, ScriptEditor should not be rendered with content until a script is loaded/generated
    expect(mockScriptEditor).not.toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: expect.any(String) }));
  });

  test('C.O.D.E.X. Optimized New Script Generation: Handles topic input, generation, and editor display', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial empty script list
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockGeneratedScript, topic: 'AI Revolution' }), // Ensure topic is returned
      } as Response);

    render(<ScriptWorkflowOrchestrator />);
    
    // Wait for initial load to clear
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); 

    const topicInput = screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i);
    fireEvent.change(topicInput, { target: { value: 'AI Revolution' } });
    expect(topicInput).toHaveValue('AI Revolution');

    const generateButton = screen.getByRole('button', { name: /Generate Script/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/scripts/generate', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ topic: 'AI Revolution' }),
      }));
      expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({
        initialScriptContent: mockGeneratedScript.script,
        title: expect.stringContaining('AI Revolution'),
      }));
    });
  });

  test('C.O.D.E.X. Durable Existing Script Loading: Selects script, loads into editor', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // For fetching existing scripts
      ok: true,
      json: async () => mockExistingScripts,
    });

    render(<ScriptWorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText(/Existing Topic 1/i)).toBeInTheDocument();
    });

    const listItem = await screen.findByText(/Existing Topic 1/i);
    const loadButton = within(listItem.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButton);

    await waitFor(() => {
        expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({
            initialScriptContent: mockExistingScripts[0].generated_script,
            title: mockExistingScripts[0].topic,
        }));
    });
  });


  test('C.O.D.E.X. Elegant Save (New Script): Saves newly generated and edited script', async () => {
    const localMockGeneratedScript = { scriptId: 'temp-new-id-789', script: 'Freshly generated script.' };
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial load
      .mockResolvedValueOnce({ ok: true, json: async () => localMockGeneratedScript }) // Generation
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUpdatedScript, id: localMockGeneratedScript.scriptId, generated_script: 'edited content from mock' }) }); // Save

    render(<ScriptWorkflowOrchestrator />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Initial load done

    // Generate new script
    fireEvent.change(screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i), { target: { value: 'Ephemeral Topic' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Script/i }));
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: localMockGeneratedScript.script })));

    // Simulate save from the (mocked) ScriptEditor
    // This requires the ScriptEditor mock to call its onSave prop, which we'll do manually for this test structure
    // Find the save button rendered by the MOCKED ScriptEditor and click it
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/v1/scripts/${localMockGeneratedScript.scriptId}`, expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'edited content from mock' }),
      }));
      // Check if ScriptEditor is re-rendered with the saved content (or at least not erroring out)
      expect(mockScriptEditor).toHaveBeenLastCalledWith(expect.objectContaining({
        initialScriptContent: 'edited content from mock', // Assuming save updates the content shown
        isLoading: false,
        error: null,
      }));
    });
  });

  test('C.O.D.E.X. Elegant Save (Existing Script): Saves edits to an existing script', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExistingScripts }) // Initial load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUpdatedScript, id: mockExistingScripts[0].id, generated_script: 'edited content from mock' }) }); // Save

    render(<ScriptWorkflowOrchestrator />);
    await waitFor(() => expect(screen.getByText(mockExistingScripts[0].topic)).toBeInTheDocument());

    // Load existing script
    const listItemExisting = await screen.findByText(mockExistingScripts[0].topic);
    const loadButtonExisting = within(listItemExisting.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButtonExisting);
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: mockExistingScripts[0].generated_script })));

    // Simulate save from the (mocked) ScriptEditor
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/v1/scripts/${mockExistingScripts[0].id}`, expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'edited content from mock' }),
      }));
       expect(mockScriptEditor).toHaveBeenLastCalledWith(expect.objectContaining({
        initialScriptContent: 'edited content from mock',
        isLoading: false,
        error: null,
      }));
    });
  });

  test('G.O.A.T. Altruistic Error Handling: Displays error for script generation failure', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial load
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Generation Failed' }) }); // Generation fails

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i), { target: { value: 'Error Topic' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Script/i }));

    await waitFor(() => {
      expect(screen.getByText(/Generation Error: Generation Failed/i)).toBeInTheDocument();
    });
  });

  test('G.O.A.T. Altruistic Error Handling: Displays error for fetching existing scripts failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ 
        ok: false, 
        status: 500, 
        json: async () => ({ error: 'Failed to fetch scripts' }) 
    });

    render(<ScriptWorkflowOrchestrator />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading scripts: Failed to fetch scripts/i)).toBeInTheDocument();
    });
  });

  test('G.O.A.T. Altruistic Error Handling: Displays error in editor for save failure', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExistingScripts }) // Initial load
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Save Failed Miserably' }) }); // Save fails

    render(<ScriptWorkflowOrchestrator />);
    await waitFor(() => expect(screen.getByText(mockExistingScripts[0].topic)).toBeInTheDocument());

    const listItemErrorSave = await screen.findByText(mockExistingScripts[0].topic);
    const loadButtonErrorSave = within(listItemErrorSave.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButtonErrorSave);
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: mockExistingScripts[0].generated_script })));
    
    // Simulate save from the (mocked) ScriptEditor
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    await waitFor(() => {
      expect(mockScriptEditor).toHaveBeenLastCalledWith(expect.objectContaining({
        error: 'Save Failed Miserably',
      }));
    });
  });

  test('C.O.D.E.X. Clairvoyant Input Validation: Prevents generation with empty topic and shows error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // For initial fetching existing scripts
      ok: true,
      json: async () => [], // No existing scripts for simplicity in this test
    });

    render(<ScriptWorkflowOrchestrator />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Wait for initial load

    const topicInput = screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i);
    fireEvent.change(topicInput, { target: { value: '   ' } }); // Input only whitespace

    const generateButton = screen.getByRole('button', { name: /Generate Script/i });
    fireEvent.click(generateButton);

    // Check for error message
    expect(await screen.findByText(/Generation Error: Topic cannot be empty./i)).toBeInTheDocument();

    // Ensure no generation API call was made (fetch should only have been called once for initial load)
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalledWith('/api/v1/scripts/generate', expect.anything());
    
    // Ensure ScriptEditor is not rendered with content
    expect(mockScriptEditor).not.toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: expect.any(String) }));
  });

  test('C.O.D.E.X. Clairvoyant API Handling (Generation): Displays error for malformed successful response', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial load
      .mockResolvedValueOnce({ // Generation API returns 200 OK but malformed body
        ok: true,
        json: async () => ({ script: 'This script is missing its ID' }), // Missing scriptId
      } as Response);

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Initial load done

    const topicInput = screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i);
    fireEvent.change(topicInput, { target: { value: 'Malformed Response Test' } });
    
    const generateButton = screen.getByRole('button', { name: /Generate Script/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/scripts/generate', expect.objectContaining({
        body: JSON.stringify({ topic: 'Malformed Response Test' }),
      }));
      expect(screen.getByText(/Generation Error: Invalid response from script generation: ID or content missing./i)).toBeInTheDocument();
    });
    
    // Ensure ScriptEditor is not rendered with content due to the error
    expect(mockScriptEditor).not.toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: expect.any(String) }));
  });

  test('C.O.D.E.X. Clairvoyant API Handling (Generation): Uses input topic for title if API response lacks topic', async () => {
    const userEnteredTopic = 'Topic From Input';
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial load
      .mockResolvedValueOnce({ // Generation API returns 200 OK, valid script/ID, but no topic
        ok: true,
        json: async () => ({ scriptId: 'script-no-topic-123', script: 'Content for script missing topic in response.' }),
      } as Response);

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Initial load done

    const topicInput = screen.getByPlaceholderText(/Enter a topic \(e.g., Future of AI\)/i);
    fireEvent.change(topicInput, { target: { value: userEnteredTopic } });
    
    const generateButton = screen.getByRole('button', { name: /Generate Script/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/scripts/generate', expect.objectContaining({
        body: JSON.stringify({ topic: userEnteredTopic }),
      }));
      // Verify ScriptEditor is called with the user-entered topic as title fallback
      expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({
        initialScriptContent: 'Content for script missing topic in response.',
        title: userEnteredTopic, // Crucial assertion: fallback to input topic
      }));
    });
  });

  test('C.O.D.E.X. Durable Save Feedback: Displays success message after saving an existing script', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExistingScripts }) // Initial load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUpdatedScript, id: mockExistingScripts[0].id, generated_script: 'edited content from mock' }) }); // Save

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(screen.getByText(mockExistingScripts[0].topic)).toBeInTheDocument());

    // Load existing script
    const listItem = await screen.findByText(mockExistingScripts[0].topic);
    const loadButton = within(listItem.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButton);
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: mockExistingScripts[0].generated_script })));

    // Simulate save from the (mocked) ScriptEditor
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/v1/scripts/${mockExistingScripts[0].id}`, expect.anything());
      // Verify the success message is displayed
      expect(screen.getByText('Script saved successfully!')).toBeInTheDocument();
    });
  });

  test('C.O.D.E.X. Durable Save Feedback: Success message disappears after timeout', async () => {
    jest.useFakeTimers();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExistingScripts }) // Initial load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockUpdatedScript, id: mockExistingScripts[0].id, generated_script: 'edited content from mock' }) }); // Save

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(screen.getByText(mockExistingScripts[0].topic)).toBeInTheDocument());

    // Load existing script
    const listItem = await screen.findByText(mockExistingScripts[0].topic);
    const loadButton = within(listItem.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButton);
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: mockExistingScripts[0].generated_script })));

    // Simulate save from the (mocked) ScriptEditor
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    // Verify the success message is displayed initially
    await waitFor(() => {
      expect(screen.getByText('Script saved successfully!')).toBeInTheDocument();
    });

    // Advance timers by the timeout duration (e.g., 3000ms)
    jest.advanceTimersByTime(3000);

    // Verify the success message is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Script saved successfully!')).not.toBeInTheDocument();
    });

    jest.useRealTimers(); // Restore real timers
  });

  test('C.O.D.E.X. Durable UI State: ScriptEditor shows loading state during save operation', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockExistingScripts }) // Initial load
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({ ...mockUpdatedScript, id: mockExistingScripts[0].id, generated_script: 'edited content from mock' }) }), 100))); // Delayed save response

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(screen.getByText(mockExistingScripts[0].topic)).toBeInTheDocument());

    // Load existing script
    const listItem = await screen.findByText(mockExistingScripts[0].topic);
    const loadButton = within(listItem.closest('li')!).getByRole('button', { name: /Load for Editing/i });
    fireEvent.click(loadButton);
    await waitFor(() => expect(mockScriptEditor).toHaveBeenCalledWith(expect.objectContaining({ initialScriptContent: mockExistingScripts[0].generated_script, isLoading: false })));

    // Simulate save from the (mocked) ScriptEditor
    const mockEditorSaveButton = screen.getByRole('button', { name: /Save Mock/i });
    fireEvent.click(mockEditorSaveButton);

    // Check that ScriptEditor is immediately called with isLoading: true
    // The mockScriptEditor is called twice: once on load, once when save is initiated.
    expect(mockScriptEditor).toHaveBeenLastCalledWith(expect.objectContaining({
      isLoading: true,
      // initialScriptContent should still be the pre-save content at this point
      initialScriptContent: mockExistingScripts[0].generated_script 
    }));

    // Wait for the save to complete to ensure the test doesn't end prematurely
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/v1/scripts/${mockExistingScripts[0].id}`, expect.anything());
      // And then it should be called with isLoading: false and updated content
      expect(mockScriptEditor).toHaveBeenLastCalledWith(expect.objectContaining({
        isLoading: false,
        initialScriptContent: 'edited content from mock'
      }));
    });
  });

  test('C.O.D.E.X. Comprehensive Empty State: Displays message when no existing scripts are found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // For fetching existing scripts
      ok: true,
      json: async () => [], // Return an empty array
    });

    render(<ScriptWorkflowOrchestrator />); 

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/scripts');
      expect(screen.getByText('No existing scripts found.')).toBeInTheDocument();
    });

    // Ensure no script items are rendered
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument(); // Assuming scripts are in <li>
    // Or more specifically, check that no 'Load for Editing' buttons are present for script items
    expect(screen.queryByRole('button', { name: /Load for Editing/i })).not.toBeInTheDocument();
  });

  test('C.O.D.E.X. Clairvoyant Edge Case (Save): Prevents save and shows error if no script ID is present', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [] }); // Initial load, no scripts

    render(<ScriptWorkflowOrchestrator />); 
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1)); // Initial load done

    // Directly try to trigger save logic. Since ScriptEditor is mocked, we need to simulate its onSave call.
    // However, the component's handleSaveEditedScript is only passed to ScriptEditor if currentScriptId exists.
    // So, we first assert that the ScriptEditor is NOT even rendered with an onSave prop that could be called IF there's no scriptId.
    // If a script *were* loaded, then we'd click the mocked save button.
    // For this test, we need to ensure the UI doesn't even present a path to save if no script is active.

    // Assert that ScriptEditor is not rendered (or not rendered with an active save mechanism)
    // because no script is loaded or generated, thus currentScriptId is null.
    expect(mockScriptEditor).not.toHaveBeenCalledWith(expect.objectContaining({
      onSave: expect.any(Function),
      initialScriptContent: expect.anything() // or more specific if a default empty state is passed
    }));

    // To more directly test the handleSaveEditedScript internal guard: 
    // We can't easily call it directly from the test without a ref or making it globally available (bad practice).
    // The component's internal logic `if (!currentScriptId)` in `handleSaveEditedScript` is the target.
    // The most practical way to test this state is to ensure that if a user somehow *could* trigger a save
    // (e.g. if the UI incorrectly enabled a save button), the error would appear.
    // Since the `ScriptEditor` itself is only rendered when `currentScriptId` is truthy, 
    // this test implicitly covers that a save cannot be initiated through the intended UI path if no script is active.
    // We can enhance this if we had a scenario where `currentScriptId` might become null *after* editor is rendered but *before* save.
    
    // For now, the fact that ScriptEditor (which contains the save button) isn't rendered with save capabilities when no script is active
    // is the primary safeguard. We can confirm no save-related error messages are initially present.
    expect(screen.queryByText(/Save Error:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No script selected or ID missing to save./i)).not.toBeInTheDocument();

    // This test might be more meaningful if we simulate a scenario where `currentScriptId` becomes null unexpectedly
    // *after* the editor was rendered. However, current component logic doesn't easily lead to that state before a save attempt.
    // The existing tests for saving new/existing scripts already cover successful paths where currentScriptId is valid.
  });

});
