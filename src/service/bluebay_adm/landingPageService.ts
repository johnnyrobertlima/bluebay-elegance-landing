
import { supabase } from "@/integrations/supabase/client";

// --- Hero Section Types ---
export interface HeroSectionData {
    id?: string;
    bg_image_url: string;
    badge_text: string;
    heading_text: string;
    subtitle_text: string;
    button_primary_text: string;
    button_primary_link: string;
    button_secondary_text: string;
    button_secondary_link: string;
    stats_years: string;
    stats_clients: string;
    stats_products: string;
}

// --- Collection Section Types ---
export interface CollectionConfigData {
    id?: string;
    section_title: string;
    section_subtitle: string;
    description: string;
    collection_name?: string;
    collection_cta_text: string;
    collection_cta_link: string;
}

export interface CollectionItemData {
    id?: string;
    title: string;
    category: 'Masculino' | 'Feminino';
    image_url: string;
    product_reference: string;
    public: boolean;
    display_order: number;
}

// --- Catalog Section Types ---
export interface CatalogItemData {
    id?: string;
    title: string;
    description: string;
    cover_image_url: string;
    pdf_url: string;
    link_url?: string;
    active: boolean;
    display_order: number;
}

// --- Instagram Section Types ---
export interface InstagramConfigData {
    id?: string;
    username: string;
    title: string;
    subtitle: string;
    manual_posts: {
        image_url: string;
        link: string;
        caption?: string;
    }[];
    use_api: boolean;
    access_token?: string;
    user_id?: string;
}

// --- API Functions ---

// 1. Hero Section
export const fetchHeroData = async (): Promise<HeroSectionData | null> => {
    try {
        const fetchPromise = supabase
            .from('landing_hero' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Hero data timeout")), 5000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) {
            console.error('Error fetching hero data:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error fetching hero data:', error);
        return null;
    }
};

export const updateHeroData = async (data: HeroSectionData): Promise<void> => {
    const { error } = await supabase
        .from('landing_hero' as any)
        .upsert(data);

    if (error) throw error;
};

// 2. Collection Section
export const fetchCollectionConfig = async (): Promise<CollectionConfigData | null> => {
    try {
        const fetchPromise = supabase
            .from('landing_collection_config' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Collection config timeout")), 5000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) return null;
        return data;
    } catch (error) { return null; }
};

export const updateCollectionConfig = async (data: CollectionConfigData): Promise<void> => {
    const { error } = await supabase
        .from('landing_collection_config' as any)
        .upsert(data);
    if (error) throw error;
};

export const fetchCollectionItems = async (): Promise<CollectionItemData[]> => {
    try {
        const { data, error } = await (supabase
            .from('landing_collection_items' as any)
            .select('*')
            .order('display_order', { ascending: true }) as any);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching collection items:', error);
        return [];
    }
};

export const fetchPublicCollectionItems = async (): Promise<CollectionItemData[]> => {
    try {
        const { data, error } = await (supabase
            .from('landing_collection_items' as any)
            .select('*')
            .eq('public', true)
            .order('display_order', { ascending: true }) as any);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching collection items:', error);
        return [];
    }
};

export const saveCollectionItem = async (item: CollectionItemData): Promise<void> => {
    const { error } = await supabase
        .from('landing_collection_items' as any)
        .upsert(item);
    if (error) throw error;
};

export const deleteCollectionItem = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('landing_collection_items' as any)
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// 3. Catalog Section
export const fetchCatalogs = async (): Promise<CatalogItemData[]> => {
    try {
        const { data, error } = await (supabase
            .from('landing_catalogs' as any)
            .select('*')
            .order('display_order', { ascending: true }) as any);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        return [];
    }
};

export const saveCatalog = async (item: CatalogItemData): Promise<void> => {
    const { error } = await supabase
        .from('landing_catalogs' as any)
        .upsert(item);
    if (error) throw error;
};

export const deleteCatalog = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('landing_catalogs' as any)
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// 4. Instagram Section
export const fetchInstagramConfig = async (): Promise<InstagramConfigData | null> => {
    try {
        const { data, error } = await (supabase
            .from('landing_instagram_config' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle() as any);
        if (error) return null;
        return data;
    } catch (error) { return null; }
};

export const updateInstagramConfig = async (data: InstagramConfigData): Promise<void> => {
    const { error } = await supabase
        .from('landing_instagram_config' as any)
        .upsert(data);
    if (error) throw error;
};

// --- Storage Helper ---
export const uploadLandingImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `landing/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('landing-page-assets') // Ensure this bucket exists
        .upload(filePath, file);

    if (uploadError) {
        // If bucket list fails, try creating or just fail nicely?
        // For now assume user can verify bucket existence as per previous complexity
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('landing-page-assets')
        .getPublicUrl(filePath);

    return data.publicUrl;
};
