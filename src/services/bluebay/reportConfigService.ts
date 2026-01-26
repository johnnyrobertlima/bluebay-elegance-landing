
import { supabase } from "@/integrations/supabase/client";

export interface ReportConfig {
    transacao: string;
    description: string;
    report_dashboard_comercial: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReportTypeConfig {
    tipo: string;
    description: string;
    report_dashboard_comercial: boolean;
    created_at: string;
    updated_at: string;
}

export const reportConfigService = {
    // --- Transaction Configs ---
    async getConfigs(): Promise<ReportConfig[]> {
        const { data, error } = await supabase
            .rpc('get_bluebay_report_configs');

        if (error) {
            console.error('Error fetching report configs:', error);
            throw error;
        }

        return data || [];
    },

    async syncConfigs(): Promise<void> {
        const { error } = await supabase
            .rpc('sync_bluebay_report_configs');

        if (error) {
            console.error('Error syncing report configs:', error);
            throw error;
        }
    },

    async updateConfig(
        transacao: string,
        description: string,
        report_dashboard_comercial: boolean
    ): Promise<void> {
        const { error } = await supabase
            .rpc('update_bluebay_report_config', {
                p_transacao: transacao,
                p_description: description,
                p_report_dashboard_comercial: report_dashboard_comercial
            });

        if (error) {
            console.error('Error updating report config:', error);
            throw error;
        }
    },

    // --- Type Configs ---
    async getTypeConfigs(): Promise<ReportTypeConfig[]> {
        const { data, error } = await supabase
            .rpc('get_bluebay_report_type_configs');

        if (error) {
            console.error('Error fetching type configs:', error);
            throw error;
        }

        return data || [];
    },

    async syncTypeConfigs(): Promise<void> {
        const { error } = await supabase
            .rpc('sync_bluebay_report_type_configs');

        if (error) {
            console.error('Error syncing type configs:', error);
            throw error;
        }
    },

    async updateTypeConfig(
        tipo: string,
        description: string,
        report_dashboard_comercial: boolean
    ): Promise<void> {
        const { error } = await supabase
            .rpc('update_bluebay_report_type_config', {
                p_tipo: tipo,
                p_description: description,
                p_report_dashboard_comercial: report_dashboard_comercial
            });

        if (error) {
            console.error('Error updating type config:', error);
            throw error;
        }
    },

    async refreshDashboardCache(days: number = 90): Promise<void> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const { error } = await supabase.rpc('populate_commercial_costs_range', {
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString()
        });

        if (error) {
            console.error('Error refreshing dashboard cache:', error);
            // We don't throw here to avoid blocking UI if cache refresh fails,
            // but we log it. The dashboard will eventually be consistent.
        }
    }
};
