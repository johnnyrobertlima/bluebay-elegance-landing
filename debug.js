
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mwvrxtvlqkttylfzzxas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnJ4dHZscWt0dHlsZnp6eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NTQ3NzQsImV4cCI6MjA1MjAzMDc3NH0.4HQUx3BPPPk-i-9EPlVdkxGu_GRfSDzQNyoq7fss-aY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function debug() {
    const { count: orderCount, error: e1 } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: true });

    const { count: invoiceCount, error: e2 } = await supabase
        .from('MV_BLUEBAY_FATURAMENTO_CENTRO_CUSTO')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Orders in DB: ${orderCount}`);
    console.log(`Total Invoices in DB: ${invoiceCount}`);
}

debug();
