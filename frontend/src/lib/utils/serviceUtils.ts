/**
 * G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Tactical' Service Utilities
 * 
 * Provides robust error handling and logging patterns for service layer operations.
 * Helps standardize error responses and ensure proper debugging information.
 */

import { PostgrestError } from '@supabase/supabase-js';

// Type for standardized service responses
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse<T>(
  message: string, 
  status: number = 500
): ServiceResponse<T> {
  return {
    data: null,
    error: message,
    status,
    success: false
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T, 
  status: number = 200
): ServiceResponse<T> {
  return {
    data,
    error: null,
    status,
    success: true
  };
}

/**
 * Handles Supabase PostgrestError objects and converts them to standard error responses
 */
export function handleSupabaseError<T>(
  error: PostgrestError | Error | unknown, 
  operation: string
): ServiceResponse<T> {
  console.error(`[Supabase Error] ${operation}:`, error);
  
  let message = 'An unexpected error occurred';
  let status = 500;
  
  if (error instanceof Error) {
    message = error.message;
  }
  
  if ('code' in (error as any) && 'message' in (error as any)) {
    const pgError = error as PostgrestError;
    message = pgError.message;
    
    // Map common PostgreSQL error codes to appropriate HTTP status codes
    if (pgError.code === '23505') { // Unique violation
      status = 409;
      message = 'This resource already exists';
    } else if (pgError.code === '42P01') { // Undefined table
      status = 500;
      message = 'Database configuration error';
    } else if (pgError.code === '42501') { // Permission denied
      status = 403;
      message = 'Permission denied to access this resource';
    }
  }
  
  return createErrorResponse(message, status);
}

/**
 * Wraps a service function with standardized error handling
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<ServiceResponse<T>> {
  try {
    const result = await fn();
    return createSuccessResponse(result);
  } catch (error) {
    return handleSupabaseError(error, operation);
  }
}
