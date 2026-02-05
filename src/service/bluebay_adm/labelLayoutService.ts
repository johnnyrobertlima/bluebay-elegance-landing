import { supabase } from "@/integrations/supabase/client";

export interface LabelElement {
    id: string;
    type: 'text' | 'barcode' | 'qrcode' | 'line' | 'rectangle' | 'circle' | 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    properties: {
        text?: string;
        fontSize?: number;
        fontFamily?: string;
        textAlign?: 'left' | 'center' | 'right';
        barcodeFormat?: 'CODE128';
        qrLevel?: 'L' | 'M' | 'Q' | 'H';
        strokeWidth?: number;
        imageUrl?: string;
    };
}

export interface LabelLayout {
    id: string;
    name: string;
    description?: string;
    layout_data: LabelElement[];
    width: number;
    height: number;
    num_columns?: number; // Optional for compatibility, default 1
    rfid_enabled?: boolean;
    rfid_column?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const fetchLayouts = async (): Promise<LabelLayout[]> => {
    const { data, error } = await supabase
        .from('bluebay_label_layouts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching layouts:', error);
        throw error;
    }

    return (data as any) || [];
};

export const fetchActiveLayout = async (): Promise<LabelLayout | null> => {
    const { data, error } = await supabase
        .from('bluebay_label_layouts')
        .select('*')
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // No rows found
            return null; // Return null if no active layout exists
        }
        console.error('Error fetching active layout:', error);
        throw error;
    }

    return (data as any);
};

export const saveLayout = async (layout: Omit<LabelLayout, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<LabelLayout> => {
    const payload: any = {
        name: layout.name,
        description: layout.description,
        layout_data: layout.layout_data,
        width: layout.width,
        height: layout.height,
        num_columns: layout.num_columns || 1,
        is_active: layout.is_active,
    };

    // Soft check: Only include these if they are present/true to avoid errors if DB is outdated
    // This allows default behavior (no RFID) to work even if columns are missing.
    // However, if RFID is enabled, we MUST try to save it, which might error if DB is missing columns.
    if (layout.rfid_enabled !== undefined) {
        payload.rfid_enabled = layout.rfid_enabled;
    }

    if (layout.rfid_column !== undefined) {
        payload.rfid_column = layout.rfid_column;
    }


    if (layout.id) {
        const { data, error } = await supabase
            .from('bluebay_label_layouts')
            .update({
                ...payload,
                updated_at: new Date().toISOString()
            })
            .eq('id', layout.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating layout:', error);
            throw error;
        }
        return (data as any);
    } else {
        const { data, error } = await supabase
            .from('bluebay_label_layouts')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating layout:', error);
            throw error;
        }
        return (data as any);
    }
};

export const deleteLayout = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('bluebay_label_layouts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting layout:', error);
        throw error;
    }
};
