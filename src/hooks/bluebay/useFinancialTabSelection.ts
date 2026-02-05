// Stub hook for Financial tab selection
import { useState, useCallback } from "react";

export const useFinancialTabSelection = () => {
  const [activeTab, setActiveTab] = useState<string>("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleClientSelect = useCallback((clientCode: string) => {
    setSelectedClient(clientCode);
  }, []);

  const handleResetClientSelection = useCallback(() => {
    setSelectedClient(null);
  }, []);

  return {
    activeTab,
    setActiveTab,
    selectedClient,
    handleClientSelect,
    handleResetClientSelection
  };
};
