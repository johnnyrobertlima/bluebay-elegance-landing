// Stub hook for Client filtered titles
import { useMemo } from "react";

export const useClientFilteredTitles = (titles: any[], selectedClient: string | null): any[] => {
  const filteredTitles = useMemo(() => {
    if (!selectedClient) return titles;
    return titles.filter((t: any) => String(t.PES_CODIGO) === String(selectedClient));
  }, [titles, selectedClient]);

  return filteredTitles;
};
