import { supabase } from "@/integrations/supabase/client";

export interface EanRecord {
    EAN: string;
    ITEM_CODIGO: string | null;
    STATUS: "DISPONIVEL" | "EM_USO";
    DATA_CADASTRO: string;
    DATA_VINCULO: string | null;
    COR?: string | null;
    TAMANHO?: string | null;
    BLUEBAY_ITEM?: {
        DESCRICAO: string;
    };
}

export const eanService = {
    fetchEans: async (
        page: number = 1,
        pageSize: number = 50,
        statusFilter: string = "all",
        search: string = ""
    ) => {
        let query = supabase
            .from("BLUEBAY_EAN")
            .select(`
        *
      `, { count: "exact" });

        if (statusFilter !== "all") {
            query = query.eq("STATUS", statusFilter);
        }

        if (search) {
            // Search by EAN or Item Code
            query = query.or(`EAN.ilike.%${search}%,ITEM_CODIGO.ilike.%${search}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.range(from, to).order("DATA_CADASTRO", { ascending: false });

        const { data, error, count } = await query;

        if (error) throw error;

        return { data: data as EanRecord[], count };
    },

    uploadEans: async (eans: string[]) => {
        // Process in chunks of 100 to avoid request size limits
        const chunkSize = 100;
        const errors: string[] = [];
        let successCount = 0;

        // Filter duplicates within the input array
        const uniqueEans = [...new Set(eans)];

        for (let i = 0; i < uniqueEans.length; i += chunkSize) {
            const chunk = uniqueEans.slice(i, i + chunkSize);

            const records = chunk.map(ean => ({
                EAN: ean,
                STATUS: "DISPONIVEL"
            }));

            const { error } = await supabase
                .from("BLUEBAY_EAN")
                .upsert(records, { onConflict: 'EAN', ignoreDuplicates: true });

            if (error) {
                console.error("Error inserting chunk:", error);
                errors.push(`Erro no lote ${i}: ${error.message}`);
            } else {
                successCount += chunk.length;
            }
        }

        return { successCount, errors };
    },

    fetchAvailableEans: async (limit: number) => {
        const { data, error } = await supabase
            .from("BLUEBAY_EAN")
            .select("EAN")
            .eq("STATUS", "DISPONIVEL")
            .limit(limit);

        if (error) throw error;
        return data.map(d => d.EAN);
    },

    bindEanToItem: async (ean: string, itemCode: string, color: string, size: string) => {
        const { error } = await supabase
            .from("BLUEBAY_EAN")
            .update({
                ITEM_CODIGO: itemCode,
                STATUS: "EM_USO",
                COR: color,
                TAMANHO: size,
                DATA_VINCULO: new Date().toISOString()
            })
            .eq("EAN", ean);

        if (error) throw error;
    },

    fetchItemVariations: async (itemCode: string) => {
        const { data, error } = await supabase
            .from("BLUEBAY_EAN")
            .select("*")
            .eq("ITEM_CODIGO", itemCode);

        if (error) throw error;
        return data as EanRecord[];
    }
};
