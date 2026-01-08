
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";

export const useClientEmails = (titles: FinancialTitle[]) => {
  const [clientsEmailsMap, setClientsEmailsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClientEmails = async () => {
      // Extract unique client codes
      const clienteCodigos = [...new Set(titles.map(title => String(title.PES_CODIGO)))];
      
      if (clienteCodigos.length === 0) return;
      
      try {
        // Convert string[] to number[] for the IN condition
        const clienteCodigosNumeric = clienteCodigos.map(code => {
          // If code is already a number as string, convert it
          // If it can't be converted to a valid number, use a fallback like -1
          const numericValue = Number(code);
          return isNaN(numericValue) ? -1 : numericValue;
        });
        
        // Now use the numeric array for the IN condition
        const { data: clientes, error } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, EMAIL')
          .in('PES_CODIGO', clienteCodigosNumeric);
        
        if (error) {
          console.error("Erro ao buscar emails dos clientes:", error);
          return;
        }
        
        // Create email map by client code
        const emailsMap: Record<string, string> = {};
        clientes?.forEach(cliente => {
          emailsMap[String(cliente.PES_CODIGO)] = cliente.EMAIL || "";
        });
        
        setClientsEmailsMap(emailsMap);
      } catch (error) {
        console.error("Erro ao processar emails dos clientes:", error);
      }
    };
    
    if (titles.length > 0) {
      fetchClientEmails();
    }
  }, [titles]);

  return { clientsEmailsMap };
};
