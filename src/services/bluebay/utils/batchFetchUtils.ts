import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches data in batches to handle large datasets
 */
export const fetchInBatches = async <T>(
  queryFn: (offset: number, limit: number) => Promise<{ data: T[] | null; error: any }>,
  batchSize: number = 1000
): Promise<T[]> => {
  let allData: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await queryFn(offset, batchSize);
    
    if (error) {
      console.error("Error fetching batch:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData = [...allData, ...data];
      offset += batchSize;
      
      // If we got less than the batch size, we've reached the end
      if (data.length < batchSize) {
        hasMore = false;
      }
    }
  }
  
  return allData;
};

/**
 * Execute query with retry logic
 */
export const executeWithRetry = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | null> => {
  let lastError: any = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} threw an error:`, error);
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  
  console.error("All retry attempts failed:", lastError);
  throw lastError;
};
