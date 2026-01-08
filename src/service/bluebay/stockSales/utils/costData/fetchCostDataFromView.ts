
import { supabase } from "@/integrations/supabase/client";
import type { CostDataRecord } from './costDataTypes';

/**
 * Fetches cost data from the view in the database 
 * with optional filtering
 */
export const fetchCostDataFromView = async (
  options?: {
    limit?: number;
    filter?: Record<string, any>;
  }
): Promise<CostDataRecord[]> => {
  try {
    const { limit = 500, filter = {} } = options || {};
    
    console.log("Fetching cost data from view with options:", { limit, filter });
    
    // Start building the query
    let query = supabase
      .from('vw_custos_items' as any)
      .select('*')
      .limit(limit);
    
    // Apply additional filters if provided
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    // Use type assertion to avoid TypeScript deep instantiation issues
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching cost data from view:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No cost data found in view");
      return [];
    }
    
    console.log(`Fetched ${data.length} cost records from the view`);
    
    // Use type assertion to avoid deep instantiation issues
    return data as unknown as CostDataRecord[];
  } catch (error) {
    console.error("Error in fetchCostDataFromView:", error);
    return [];
  }
};
