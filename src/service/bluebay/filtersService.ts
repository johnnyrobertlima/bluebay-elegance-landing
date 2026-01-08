
import { supabase } from "@/integrations/supabase/client";

export const fetchFilterOptions = async () => {
  try {
    // Fetch all distinct cost centers (CENTROCUSTO)
    const { data: brandsData, error: brandsError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('CENTROCUSTO')
      .not('CENTROCUSTO', 'is', null)
      .order('CENTROCUSTO');
    
    if (brandsError) {
      throw new Error(`Error fetching cost centers: ${brandsError.message}`);
    }

    // Log raw data to see what's actually coming from the database
    console.log("Raw CENTROCUSTO data from database:", brandsData);

    // Get unique cost centers
    const brands = Array.from(new Set(brandsData.map(b => b.CENTROCUSTO)))
      .filter(Boolean) // Filter out null/undefined/empty values
      .map(centrocusto => ({
        value: centrocusto, 
        label: centrocusto
      }));

    console.log("Centros de custo disponíveis após processamento:", brands.map(b => b.value).join(", "));

    // Fetch representatives
    const { data: reps, error: repsError } = await supabase
      .from('vw_representantes')
      .select('codigo_representante, nome_representante')
      .order('nome_representante');
    
    if (repsError) {
      throw new Error(`Error fetching representatives: ${repsError.message}`);
    }

    // Status values with human-readable labels
    const statuses = [
      { value: "0", label: "Em Digitação" },
      { value: "1", label: "Em Aberto" },
      { value: "2", label: "Atendido Parcialmente" },
      { value: "3", label: "Totalmente Atendido" },
      { value: "4", label: "Cancelado" }
    ];

    return {
      brands,
      representatives: reps.map(r => ({ 
        value: r.codigo_representante.toString(), 
        label: r.nome_representante || `Representante ${r.codigo_representante}` 
      })),
      statuses
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      brands: [],
      representatives: [],
      statuses: []
    };
  }
};
