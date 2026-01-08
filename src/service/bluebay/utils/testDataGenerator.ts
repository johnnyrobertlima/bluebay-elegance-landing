
import { ItemReport } from "../types";

/**
 * Generate test data for development and testing purposes
 */
export const generateTestData = (): ItemReport[] => {
  console.log("Using test data for development");
  return [
    {
      ITEM_CODIGO: "MWJ-002/A",
      DESCRICAO: "Produto MWJ-002/A",
      GRU_DESCRICAO: "Grupo A",
      TOTAL_QUANTIDADE: 100,
      TOTAL_VALOR: 5000,
      OCORRENCIAS: 5
    },
    {
      ITEM_CODIGO: "MFFZ-400/PF",
      DESCRICAO: "Produto MFFZ-400/PF",
      GRU_DESCRICAO: "Grupo B",
      TOTAL_QUANTIDADE: 200,
      TOTAL_VALOR: 8000,
      OCORRENCIAS: 8
    },
    {
      ITEM_CODIGO: "CLM-100/SM",
      DESCRICAO: "Produto CLM-100/SM",
      GRU_DESCRICAO: "Grupo A",
      TOTAL_QUANTIDADE: 50,
      TOTAL_VALOR: 2500,
      OCORRENCIAS: 3
    },
    {
      ITEM_CODIGO: "MWJ-001/D",
      DESCRICAO: "Produto MWJ-001/D",
      GRU_DESCRICAO: "Grupo C",
      TOTAL_QUANTIDADE: 75,
      TOTAL_VALOR: 3750,
      OCORRENCIAS: 4
    },
    {
      ITEM_CODIGO: "LS-149/PB",
      DESCRICAO: "Produto LS-149/PB",
      GRU_DESCRICAO: "Grupo B",
      TOTAL_QUANTIDADE: 120,
      TOTAL_VALOR: 6000,
      OCORRENCIAS: 6
    }
  ];
};

/**
 * Check if running in development environment
 */
export const isDevelopmentEnvironment = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname.includes('lovable') ||
     window.location.hostname.includes('gptengineer'));
};
