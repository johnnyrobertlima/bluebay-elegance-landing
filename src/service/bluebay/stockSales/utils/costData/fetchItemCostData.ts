
import { supabase } from "@/integrations/supabase/client";
import type { CostDataRecord } from './costDataTypes';
import { processCostData } from './costDataProcessor';
import { fetchCostDataFromView } from './fetchCostDataFromView';

/**
 * Fetches item cost data using different strategies:
 * 1. First trying to fetch specific item by code
 * 2. If that fails, falls back to fetching all cost data
 * 3. Returns processed cost data for the specific item code
 */
export const fetchItemCostData = async (
  itemCode: string
): Promise<CostDataRecord | undefined> => {
  try {
    console.log(`Fetching cost data for item: ${itemCode}`);
    
    // First try to query by specific item code for better performance
    const { data: specificItemData, error: specificError } = await supabase
      .from('vw_custos_items' as any)
      .select('*')
      .eq('ITEM_CODIGO', itemCode)
      .limit(1);
    
    if (specificError) {
      console.error(`Error fetching specific cost for item ${itemCode}:`, specificError);
    }
    
    // If we found the item directly, return the processed data
    if (specificItemData && specificItemData.length > 0) {
      console.log(`Found cost data directly for item ${itemCode}`);
      return processCostData([specificItemData[0] as unknown as CostDataRecord])[0];
    }
    
    // If direct query failed, try getting from all cost data
    console.log(`No specific cost data found for ${itemCode}, trying general cost data`);
    
    // Fetch all cost data with a reasonable limit
    const allCostData = await fetchCostDataFromView({ limit: 5000 });
    
    // Process all cost data
    const processedData = processCostData(allCostData);
    
    // Find the cost data for the requested item
    const itemCostData = processedData.find(item => item.ITEM_CODIGO === itemCode);
    
    if (itemCostData) {
      console.log(`Found cost data for item ${itemCode} in general cost data`);
      return itemCostData;
    }
    
    console.log(`No cost data found for item ${itemCode}`);
    return undefined;
  } catch (error) {
    console.error(`Error in fetchItemCostData for ${itemCode}:`, error);
    return undefined;
  }
};
