
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwvrxtvlqkttylfzzxas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnJ4dHZscWt0dHlsZnp6eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NTQ3NzQsImV4cCI6MjA1MjAzMDc3NH0.4HQUx3BPPPk-i-9EPlVdkxGu_GRfSDzQNyoq7fss-aY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectUnclassified() {
    console.log('Fetching raw invoices...');

    // Fetch raw invoices directly
    const { data, error } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('PED_NUMPEDIDO, PED_ANOBASE, NOTA, VALOR_NOTA, STATUS')
        .not('PED_NUMPEDIDO', 'is', null)
        .gt('VALOR_NOTA', 0)
        .neq('STATUS', '2')
        .limit(10);

    if (error) {
        console.error('Error fetching raw:', error);
        return;
    }

    console.log(`Found ${data.length} sample raw records:`);
    console.table(data);

    // Try to find unmatched ones by checking against orders manually
    for (const sample of data) {
        const pedNum = String(sample.PED_NUMPEDIDO).trim();
        if (!pedNum) continue;

        console.log(`\nChecking Order: '${pedNum}' (Year: ${sample.PED_ANOBASE})`);

        // 1. Normalized match (strip leading zeros)
        const normalized = pedNum.replace(/^0+/, '');

        const { data: norm, error: normError } = await supabase
            .from('BLUEBAY_PEDIDO')
            .select('PED_NUMPEDIDO, CENTROCUSTO')
            .ilike('PED_NUMPEDIDO', `%${normalized}`) // fuzzy
            .eq('PED_ANOBASE', sample.PED_ANOBASE)
            .limit(1);

        if (norm && norm.length > 0) {
            console.log(`   -> FOUND MATCH via fuzzy '%${normalized}':`, norm[0]);
        } else {
            console.log(`   -> NO MATCH FOUND for normalized '%${normalized}'`);
        }
    }
}

inspectUnclassified();
