
// This is now a barrel file that exports from the individual service modules
import { ItemReport, ItemDetail } from "./types";
import { fetchBluebayItemsReport } from "./itemReportsService";
import { fetchItemDetails } from "./itemDetailsService";

// Re-export the types and functions
export type { ItemReport, ItemDetail };
export { fetchBluebayItemsReport, fetchItemDetails };
