// Stub hook for Collection status
import { useState, useCallback } from "react";

interface UseCollectionStatusProps {
  userName?: string;
}

interface CollectionRecord {
  id: string;
  clientCode: string;
  date: string;
  collectedBy: string;
}

export const useCollectionStatus = (props?: UseCollectionStatusProps) => {
  const [collectedClients, setCollectedClients] = useState<Set<string>>(new Set());
  const [collectionRecords, setCollectionRecords] = useState<CollectionRecord[]>([]);
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);
  
  const handleCollectionStatusChange = useCallback((clientCode: string, collected: boolean) => {
    setCollectedClients(prev => {
      const newSet = new Set(prev);
      if (collected) {
        newSet.add(clientCode);
      } else {
        newSet.delete(clientCode);
      }
      return newSet;
    });
  }, []);

  const toggleShowCollected = useCallback(() => {
    setShowCollectedOnly(prev => !prev);
  }, []);

  const resetClientCollectionStatus = useCallback((clientCode: string) => {
    setCollectedClients(prev => {
      const newSet = new Set(prev);
      newSet.delete(clientCode);
      return newSet;
    });
  }, []);

  const resetAllCollectionStatus = useCallback(() => {
    setCollectedClients(new Set());
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
