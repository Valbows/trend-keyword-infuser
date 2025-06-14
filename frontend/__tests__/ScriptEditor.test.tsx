import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScriptEditor from '../src/components/ScriptEditor'; // Adjust path as necessary

describe('ScriptEditor Component - G.O.A.T. C.O.D.E.X. B.O.T. Validation Suite', () => {
  const mockOnSave = jest.fn();
  const initialProps = {
    initialScriptContent: 'This is the initial script content.',
    isLoading: false,
    error: null,
    onSave: mockOnSave,
    title: 'Test Script Title',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('G.O.A.T. Renders Clairvoyantly: Initial content, title, and enabled save button', () => {
    render(<ScriptEditor {...initialProps} />);
    expect(screen.getByText('Test Script Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is the initial script content.')).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: /Save Edits/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled(); // Should be disabled initially as content is not dirty
  });

  test('G.O.A.T. Clairvoyant UI: Unsaved changes indicator is not visible initially', () => {
    render(<ScriptEditor {...initialProps} />);
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
  });

  test('C.O.D.E.X. Optimized Editing: User input updates textarea value', () => {
    render(<ScriptEditor {...initialProps} />);
    const textarea = screen.getByDisplayValue('This is the initial script content.');
    fireEvent.change(textarea, { target: { value: 'User is making an elegant edit.' } });
    expect(textarea).toHaveValue('User is making an elegant edit.');
  });

  test('G.O.A.T. Clairvoyant UI: Unsaved changes indicator becomes visible after editing', () => {
    render(<ScriptEditor {...initialProps} />);
    const textarea = screen.getByDisplayValue(initialProps.initialScriptContent);
    fireEvent.change(textarea, { target: { value: 'User is making an elegant edit.' } });
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
  });

  test('C.O.D.E.X. Durable UI: Save button enables when content is dirty and not loading', () => {
    render(<ScriptEditor {...initialProps} isLoading={false} />);
    const textarea = screen.getByDisplayValue(initialProps.initialScriptContent);
    const saveButton = screen.getByRole('button', { name: /Save Edits/i });

    // Initially not dirty, button disabled
    expect(saveButton).toBeDisabled();

    // Make it dirty
    fireEvent.change(textarea, { target: { value: 'User is making an elegant edit.' } });
    expect(saveButton).toBeEnabled();
  });

  test('C.O.D.E.X. Durable Save: onSave is called with edited content on button click', async () => {
    render(<ScriptEditor {...initialProps} />);
    const textarea = screen.getByDisplayValue('This is the initial script content.');
    fireEvent.change(textarea, { target: { value: 'Final, durable script content.' } });
    
    const saveButton = screen.getByRole('button', { name: /Save Edits/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith('Final, durable script content.');
    });
  });

  test('G.O.A.T. Clairvoyant UI: Unsaved changes indicator hides after successful save', async () => {
    const { rerender } = render(<ScriptEditor {...initialProps} />); // Obtain rerender from the initial render
    
    const textarea = screen.getByDisplayValue(initialProps.initialScriptContent);
    const editedContent = 'Edited content about to be saved.';
    
    // Edit content and verify indicator appears
    fireEvent.change(textarea, { target: { value: editedContent } });
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /Save Edits/i });
    fireEvent.click(saveButton);
    
    // Wait for the onSave mock to be called with the edited content
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith(editedContent));
    
    // Simulate parent component updating initialScriptContent to the new (saved) content
    // This action should result in the component becoming non-dirty
    rerender(<ScriptEditor {...initialProps} initialScriptContent={editedContent} />);
    
    // Verify indicator is now hidden as the content is considered saved and clean
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
  });

  test('C.O.D.E.X. Elegant Loading State: Save button disabled and shows loading text', () => {
    render(<ScriptEditor {...initialProps} isLoading={true} />);
    const saveButton = screen.getByRole('button', { name: /Saving.../i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(screen.getByDisplayValue(initialProps.initialScriptContent)).toBeDisabled(); // Textarea should also be disabled
  });

  test('C.O.D.E.X. Clairvoyant Error Display: Error message is shown when error prop is set', () => {
    const errorMessage = 'A critical error has occurred. Rectification required.';
    render(<ScriptEditor {...initialProps} error={errorMessage} />);
    expect(screen.getByText(/Error: A critical error has occurred\. Rectification required\./i)).toBeInTheDocument();
    // Ensure save button is disabled when there's an error
    const saveButton = screen.getByRole('button', { name: /Save Edits/i });
    expect(saveButton).toBeDisabled(); 
  });

  test('C.O.D.E.X. Altruistic UI: No error message displayed when error prop is null', () => {
    render(<ScriptEditor {...initialProps} error={null} />);
    expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
  });

  test('G.O.A.T. Altruistic Update: Component updates and resets dirty state when initialScriptContent prop changes', () => {
    const { rerender } = render(<ScriptEditor {...initialProps} />);
    expect(screen.getByDisplayValue('This is the initial script content.')).toBeInTheDocument();

    const textarea = screen.getByDisplayValue(initialProps.initialScriptContent);

    // Make it dirty
    fireEvent.change(textarea, { target: { value: 'Some new edits making it dirty.' } });
    expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    let saveButton = screen.getByRole('button', { name: /Save Edits/i });
    expect(saveButton).toBeEnabled();

    // Now, simulate parent updating initialScriptContent to a new "canonical" content
    const newCanonicalContent = 'Updated script content from props.';
    rerender(<ScriptEditor {...initialProps} initialScriptContent={newCanonicalContent} />);    
    
    expect(screen.getByDisplayValue(newCanonicalContent)).toBeInTheDocument();
    // Textarea value should reset to the new initialScriptContent
    expect(textarea).toHaveValue(newCanonicalContent); 
    // Indicator should be gone as editedScript now matches new initialScriptContent
    expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    // Save button should be disabled again
    saveButton = screen.getByRole('button', { name: /Save Edits/i });
    expect(saveButton).toBeDisabled();
  });

  test('C.O.D.E.X. Elegant Default Title: Renders default title when title prop is omitted', () => {
    const propsWithoutTitle = { ...initialProps, title: undefined };
    render(<ScriptEditor {...propsWithoutTitle} />);
    expect(screen.getByText('Edit Your Script')).toBeInTheDocument(); // Default title
    expect(screen.queryByText('Test Script Title')).not.toBeInTheDocument(); // Custom test title should not be there
    expect(screen.getByDisplayValue('This is the initial script content.')).toBeInTheDocument();
  });
});
