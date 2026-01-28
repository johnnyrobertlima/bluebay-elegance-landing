
import { supabase } from "./src/integrations/supabase/client";

async function checkAtacadao() {
    console.log("Checking ATACADAO...");
    const { data: people, error: pError } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO, CIDADE, UF')
        .or('APELIDO.ilike.%ATACADAO%,RAZAOSOCIAL.ilike.%ATACADAO%');

    if (pError) {
        console.error("Error fetching people:", pError);
        return;
    }

    console.log("Found people:", people);

    if (people && people.length > 0) {
        const pids = people.map(p => p.PES_CODIGO);
        const { data: orders, error: oError } = await supabase
            .from('BLUEBAY_PEDIDO')
            .select('PED_NUMPEDIDO, PES_CODIGO, DATA_PEDIDO, TOTAL_PRODUTO, PED_ANOBASE')
            .in('PES_CODIGO', pids)
            .eq('PED_ANOBASE', 2026);

        if (oError) {
            console.error("Error fetching orders:", oError);
            return;
        }

        console.log("Found orders for 2026:", orders);
    }
}

checkAtacadao();
