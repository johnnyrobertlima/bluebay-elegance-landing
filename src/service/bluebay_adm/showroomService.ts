import { supabase } from "@/integrations/supabase/client";

export interface ShowroomItem {
    item_code: string;
    description: string;
    rfid: string;
    image_url?: string;
    color?: string;
    size?: string;
}

export const getItemByRFID = async (rfid: string): Promise<ShowroomItem | null> => {
    // Search in BLUEBAY_ITEM by CODIGO_RFID
    // RFID from scanner might be case sensitive or have padding. 
    // We'll try exact match first.

    // Clean input: remove non-alphanumeric just in case, though RFID should be clean hex.
    const cleanRfid = rfid.trim().toUpperCase();

    const { data, error } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO, FOTO_PRODUTO, CORES, GRADE, CODIGO_RFID')
        .eq('CODIGO_RFID', cleanRfid)
        .maybeSingle();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching item by RFID:', error);
        }
        return null;
    }

    return {
        item_code: data.ITEM_CODIGO,
        description: data.DESCRICAO,
        rfid: data.CODIGO_RFID,
        image_url: data.FOTO_PRODUTO,
        color: data.CORES,
        size: data.GRADE
    };
};

export interface WithdrawalData {
    representative_id?: number | null;
    representative_name?: string;
    items: ShowroomItem[];
}

export const createWithdrawal = async (data: WithdrawalData): Promise<{ id: string } | null> => {
    // 1. Create Withdrawal Header
    const { data: withdrawal, error: wError } = await supabase
        .from('bluebay_showroom_withdrawals')
        .insert([{
            representative_id: data.representative_id || null,
            representative_name: data.representative_name || 'Retirada Interna',
            user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

    if (wError || !withdrawal) {
        console.error('Error creating withdrawal:', wError);
        throw wError;
    }

    // 2. Create Items
    const itemsPayload = data.items.map(item => ({
        withdrawal_id: withdrawal.id,
        item_code: item.item_code,
        rfid: item.rfid,
        description: item.description
    }));

    const { error: iError } = await supabase
        .from('bluebay_showroom_items')
        .insert(itemsPayload);

    if (iError) {
        console.error('Error adding items:', iError);
        // Should probably rollback or alert, but for now throwing
        throw iError;
    }

    return { id: withdrawal.id };
};

export interface ShowroomControlItem {
    item_code: string;
    description: string;
    image_url: string | null;
    stock_available: number;
    in_showroom: boolean;
    colors: string | null;
    sizes: string | null;
}

/**
 * Fetch items for Showroom Control based on tab logic
 */
export const fetchShowroomControlItems = async (mode: 'remove' | 'add' | 'list', searchTerm?: string): Promise<ShowroomControlItem[]> => {
    try {
        console.log(`[ShowroomService] Fetching for mode: ${mode}, search: "${searchTerm || ''}"`);

        // 1. Fetch Items based on Group Company (Blue Bay)
        const { data: bluebayGroups, error: groupError } = await supabase
            .from('bluebay_grupo_item')
            .select('gru_codigo, bluebay_empresa!inner(nome)')
            .ilike('bluebay_empresa.nome', '%Blue%Bay%');

        let validGroupCodes: string[] = [];
        if (bluebayGroups) {
            validGroupCodes = bluebayGroups.map(g => g.gru_codigo).filter(Boolean);
        }

        let query = supabase
            .from('BLUEBAY_ITEM')
            .select('ITEM_CODIGO, DESCRICAO, FOTO_PRODUTO, SHOWROOM, CORES, GRADE, GRU_CODIGO, empresa')
            .eq('ativo', true)
            .order('ITEM_CODIGO');

        if (validGroupCodes.length > 0) {
            query = query.in('GRU_CODIGO', validGroupCodes);
        } else {
            query = query.ilike('empresa', '%Blue%Bay%');
        }

        // 2. Logic Branching: Stock-First (Add Mode) vs Item-First (Others)
        let allItems: any[] = [];
        let stockPreloadMap = new Map<string, number>();

        const isLimitedAddMode = (mode === 'add' && (!searchTerm || searchTerm.length < 3));

        if (isLimitedAddMode) {
            // STRATEGY: Stock-First Fetch
            // Instead of fetching random items and checking if they have stock,
            // we fetch items that WE KNOW have stock > 100 from the stock table first.
            console.log('[ShowroomService] Stock-First Strategy active for ADD suggestions.');

            const { data: highStockItems, error: stockErr } = await supabase
                .from('BLUEBAY_ESTOQUE')
                .select('ITEM_CODIGO, DISPONIVEL')
                .gte('DISPONIVEL', 100)
                .limit(200); // Get top 200 candidates

            if (stockErr) throw stockErr;

            if (highStockItems && highStockItems.length > 0) {
                const codes = highStockItems.map(s => s.ITEM_CODIGO);
                highStockItems.forEach(s => stockPreloadMap.set(s.ITEM_CODIGO, Number(s.DISPONIVEL)));

                // Now fetch details for these specific items, verifying Showroom status
                const { data: itemDetails, error: itemErr } = await supabase
                    .from('BLUEBAY_ITEM')
                    .select('ITEM_CODIGO, DESCRICAO, FOTO_PRODUTO, SHOWROOM, CORES, GRADE, GRU_CODIGO, empresa')
                    .in('ITEM_CODIGO', codes)
                    .or('SHOWROOM.eq.false,SHOWROOM.is.null') // Must not be in showroom
                    .eq('ativo', true);

                if (itemErr) throw itemErr;
                allItems = itemDetails || [];
            }
        } else {
            // Standard Item-First Fetch (Search, Remove, or List modes)

            // Apply filtering for this mode
            if (mode === 'add') {
                query = query.or('SHOWROOM.eq.false,SHOWROOM.is.null'); // No limit if searching
            } else {
                query = query.eq('SHOWROOM', true);
            }

            // Apply Search Term
            if (searchTerm) {
                const cleanTerm = searchTerm.trim();
                query = query.or(`ITEM_CODIGO.ilike.%${cleanTerm}%,DESCRICAO.ilike.%${cleanTerm}%`);
            }

            // Pagination Loop
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                console.log(`[ShowroomService] Fetching page ${page} (size ${pageSize})...`);
                const { data: pageData, error: pageError } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

                if (pageError) throw pageError;

                if (pageData && pageData.length > 0) {
                    allItems = [...allItems, ...pageData];
                    if (pageData.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }

                // Safety break
                if (page > 50) {
                    console.warn('[ShowroomService] Hit max page limit (50), stopping fetch.');
                    break;
                }
            }
        }

        const items = allItems;
        console.log(`[ShowroomService] Total Items fetched: ${items.length}`);

        // 3. Fetch Stock (if not already preloaded)
        const itemCodes = items.map(i => i.ITEM_CODIGO);
        const stockMap = new Map<string, number>(stockPreloadMap);

        const itemsNeedingStock = itemCodes.filter(c => !stockMap.has(c));
        const chunkSize = 1000;

        if (itemsNeedingStock.length > 0) {
            for (let i = 0; i < itemsNeedingStock.length; i += chunkSize) {
                const chunk = itemsNeedingStock.slice(i, i + chunkSize);
                const { data: stockChunk, error: stockChunkError } = await supabase
                    .from('BLUEBAY_ESTOQUE')
                    .select('ITEM_CODIGO, DISPONIVEL')
                    .in('ITEM_CODIGO', chunk);

                if (stockChunkError) {
                    throw stockChunkError;
                }

                if (stockChunk) {
                    stockChunk.forEach((s: any) => {
                        const current = stockMap.get(s.ITEM_CODIGO) || 0;
                        stockMap.set(s.ITEM_CODIGO, current + (Number(s.DISPONIVEL) || 0));
                    });
                }
            }
        }

        // 4. Merge and Filter
        const result: ShowroomControlItem[] = [];

        items.forEach(item => {
            const stock = stockMap.get(item.ITEM_CODIGO) || 0;
            const inShowroom = item.SHOWROOM || false;

            // Apply Tab Logic
            let include = false;
            const threshold = 100;

            if (mode === 'list') {
                include = true;
            } else if (mode === 'remove') {
                // "Retirar": Showroom=True AND Stock < 100
                if (inShowroom && stock < threshold) include = true;
            } else if (mode === 'add') {
                // "Colocar": Showroom=False AND Stock >= 100
                if (!inShowroom && stock >= threshold) include = true;
            }

            if (include) {
                result.push({
                    item_code: item.ITEM_CODIGO,
                    description: item.DESCRICAO || '',
                    image_url: item.FOTO_PRODUTO,
                    stock_available: stock,
                    in_showroom: inShowroom,
                    colors: item.CORES,
                    sizes: item.GRADE
                });
            }
        });

        // Deduplicate Logic to solve React Key Warnings
        const uniqueResult = Array.from(new Map(result.map(item => [item.item_code, item])).values());

        return uniqueResult.sort((a, b) => a.description.localeCompare(b.description));

    } catch (err) {
        console.error('Error fetching showroom control items:', err);
        return [];
    }
};

export const toggleShowroomStatus = async (itemCode: string, newStatus: boolean): Promise<boolean> => {
    const { error } = await supabase
        .from('BLUEBAY_ITEM')
        .update({ SHOWROOM: newStatus })
        .eq('ITEM_CODIGO', itemCode);

    if (error) {
        console.error('Error updating showroom status:', error);
        return false;
    }
    return true;
};
