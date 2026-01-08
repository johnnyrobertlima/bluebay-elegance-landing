
/**
 * Centralized error handling service for stock sales analytics
 * Provides standardized logging and handling of different error types
 */

/**
 * Handles API errors with proper logging and categorization
 * @param context Description of where the error occurred
 * @param error The error object
 */
export const handleApiError = (context: string, error: unknown): void => {
  // Log the basic error with context
  console.error(`${context}:`, error);
  
  // Try to extract more detailed information based on error type
  if (error instanceof Error) {
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    
    // Check for specific error types
    if ('status' in error && typeof (error as any).status === 'number') {
      const statusCode = (error as any).status;
      console.error(`Status code: ${statusCode}`);
      logErrorByStatusCode(statusCode);
    }
  }
  
  // Log if it's not a standard Error object
  if (!(error instanceof Error)) {
    console.error("Non-standard error object received:", typeof error);
  }
};

/**
 * Logs recommendations based on HTTP status codes
 * @param statusCode HTTP status code
 */
const logErrorByStatusCode = (statusCode: number): void => {
  switch (statusCode) {
    case 400:
      console.error("Bad request. Check parameters being sent to the API.");
      break;
    case 401:
      console.error("Unauthorized. Authentication is required.");
      break;
    case 403:
      console.error("Forbidden. The current user doesn't have permission.");
      break;
    case 404:
      console.error("Not found. The requested resource doesn't exist.");
      break;
    case 429:
      console.error("Too many requests. The service is being rate limited.");
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      console.error("Server error. The server is experiencing issues.");
      break;
    default:
      console.error(`Unhandled status code: ${statusCode}`);
  }
};

/**
 * Logs data validation issues
 * @param data The data that failed validation
 * @param issues Description of validation issues
 */
export const logDataValidationError = (data: any, issues: string): void => {
  console.error("Data validation error:", issues);
  console.error("Problematic data:", JSON.stringify(data, null, 2));
};

/**
 * Creates a standardized error response object with context
 * @param message Error message
 * @param source Source of the error
 * @param originalError Original error object
 */
export const createErrorResponse = (
  message: string,
  source: string,
  originalError?: unknown
): { message: string; source: string; timestamp: string; details?: unknown } => {
  return {
    message,
    source,
    timestamp: new Date().toISOString(),
    details: originalError
  };
};
