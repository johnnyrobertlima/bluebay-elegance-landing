
import type { CostDataRecord } from './costData/costDataTypes';

/**
 * Processes cost data from various sources into a unified format
 * @param rawCostData Raw cost data from database or other sources
 * @returns Processed cost data with consistent structure
 */
export const processCostData = (rawCostData: CostDataRecord[]): CostDataRecord[] => {
  // Process and normalize cost data
  return rawCostData.map(item => {
    return {
      ...item,
      // Add any additional processing if needed
      // For example, ensuring all fields follow the same casing convention
    };
  });
};

/**
 * Gets the cost for a specific item from a collection of cost records
 * @param itemCode The code of the item to find
 * @param costRecords Array of cost data records to search in
 * @returns The cost data for the specified item or undefined if not found
 */
export const getItemCost = (itemCode: string, costRecords: CostDataRecord[]): CostDataRecord | undefined => {
  return costRecords.find(record => record.ITEM_CODIGO === itemCode);
};
