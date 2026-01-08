
import React from "react";

interface TabDefinition {
  id: string;
  label: string;
}

export const getTabDefinitions = (): TabDefinition[] => {
  return [
    { id: "titles", label: "Títulos" },
    { id: "clients", label: "Clientes" },
    { id: "clientesVencidos", label: "Clientes Vencidos" },
    { id: "cobranca", label: "Cobrança" },
    { id: "cobrados", label: "Cobrados" },
    { id: "origem", label: "Origem" }
  ];
};
