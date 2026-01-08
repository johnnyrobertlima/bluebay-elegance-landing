
import React from "react";
import { LoadingState } from "@/components/bluebay_adm/financial/LoadingState";

interface FinancialLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const FinancialLoader: React.FC<FinancialLoaderProps> = ({
  isLoading,
  children
}) => {
  if (isLoading) {
    return <LoadingState />;
  }
  
  return <>{children}</>;
};
