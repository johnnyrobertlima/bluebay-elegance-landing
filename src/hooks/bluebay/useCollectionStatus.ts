// Hook for Collection status
import { useState, useCallback } from "react";

interface UseCollectionStatusProps {
  userName?: string;
}

interface CollectionRecord {
  id: string;
  clientCode: string;
  clientName: string;
  date: string;
  collectedBy: string;
  status: string;
}

export const useCollectionStatus = (props?: UseCollectionStatusProps) => {
  const [collectedClients, setCollectedClients] = useState<string[]>([]);
  const [collectionRecords, setCollectionRecords] = useState<CollectionRecord[]>([]);
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  
  const handleCollectionStatusChange = useCallback((clientCode: string, clientName: string, status: string) => {
    setCollectedClients(prev => {
      if (status === "collected" && !prev.includes(clientCode)) {
        return [...prev, clientCode];
      } else if (status !== "collected") {
        return prev.filter(c => c !== clientCode);
      }
      return prev;
    });
    
    if (status === "collected") {
      setCollectionRecords(prev => [
        ...prev,
        {
          id: `${clientCode}-${Date.now()}`,
          clientCode,
          clientName,
          date: new Date().toISOString(),
          collectedBy: props?.userName || "Unknown",
          status
        }
      ]);
    }
  }, [props?.userName]);

  const toggleShowCollected = useCallback(() => {
    setShowCollectedOnly(prev => !prev);
  }, []);

  const resetClientCollectionStatus = useCallback((clientCode: string) => {
    setCollectedClients(prev => prev.filter(c => c !== clientCode));
    setCollectionRecords(prev => prev.filter(r => r.clientCode !== clientCode));
  }, []);

  const resetAllCollectionStatus = useCallback(() => {
    setCollectedClients([]);
    setCollectionRecords([]);
  }, []);

  return {
    status: "pending",
    updateStatus: () => {},
    collectedClients,
    collectionRecords,
    showCollectedOnly,
    handleCollectionStatusChange,
    toggleShowCollected,
    resetClientCollectionStatus,
    resetAllCollectionStatus
  };
};
