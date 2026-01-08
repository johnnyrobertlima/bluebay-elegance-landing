
/**
 * Utility for consistent debug logging
 */

/**
 * Log debug information with consistent formatting
 */
export const logDebugInfo = (...args: any[]): void => {
  console.log(...args);
};

/**
 * Log warning information with consistent formatting
 */
export const logWarning = (...args: any[]): void => {
  console.warn(...args);
};

/**
 * Log error information with consistent formatting
 */
export const logError = (...args: any[]): void => {
  console.error(...args);
};

/**
 * Log diagnostic information for a specific item
 */
export const logItemDiagnostics = (itemCode: string, message: string, data?: any): void => {
  console.log(`DIAGNÓSTICO ${itemCode}: ${message}`, data ?? '');
};

/**
 * Log cost-specific diagnostic information
 */
export const logCostDiagnostics = (itemCode: string, message: string, data?: any): void => {
  console.log(`CUSTO ${itemCode}: ${message}`, data ?? '');
};

/**
 * Log sales-specific diagnostic information
 */
export const logSalesDiagnostics = (itemCode: string, message: string, data?: any): void => {
  console.log(`VENDAS ${itemCode}: ${message}`, data ?? '');
};
