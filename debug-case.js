
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwvrxtvlqkttylfzzxas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dnJ4dHZscWt0dHlsZnp6eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NTQ3NzQsImV4cCI6MjA1MjAzMDc3NH0.4HQUx3BPPPk-i-9EPlVdkxGu_GRfSDzQNyoq7fss-aY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSpecificCase() {
    console.log('--- Inspecting Invoice 262158 ---');

    const { data: invoice, error: invError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('PED_NUMPEDIDO, PED_ANOBASE, NOTA, VALOR_NOTA')
        .eq('NOTA', '262158');

    if (invError) console.error(invError);
    else console.log('INVOICE:', JSON.stringify(invoice, null, 2));

    console.log('\n--- Inspecting Order Candidates ---');

    const { data: order, error: ordError } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('PED_NUMPEDIDO, PED_ANOBASE, CENTROCUSTO')
        .or(`PED_NUMPEDIDO.ilike.%322%`)
        .limit(20);

    if (ordError) console.error(ordError);
    else console.log('ORDERS:', JSON.stringify(order, null, 2));
}

inspectSpecificCase();
