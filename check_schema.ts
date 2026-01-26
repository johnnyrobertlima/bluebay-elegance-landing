
import { supabase } from "@/integrations/supabase/client";

async function checkSchema() {
    const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'bluebay_grupo_item' });

    if (error) {
        // If RPC fails (likely doesn't exist), try a simple select to see keys if possible, or just try to select the column
        console.log("RPC get_table_columns failed, trying select...");
        const { data: d2, error: e2 } = await supabase.from('bluebay_grupo_item').select('estacao_ano').limit(1);
        if (e2) {
            console.error("Column likely missing or other error:", e2);
        } else {
            console.log("Column 'estacao_ano' exists!");
        }
    } else {
        console.log("Columns:", data);
    }
}

checkSchema();
