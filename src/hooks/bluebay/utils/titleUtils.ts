
export const formatNumDocumento = (numDoc: string | null | undefined): string => {
  if (!numDoc) return "-";
  return numDoc.trim();
};

export const getTitleStatus = (
  vencimento: string | null | undefined,
  pagamento: string | null | undefined
): "vencido" | "a_vencer" | "pago" => {
  if (pagamento) return "pago";
  if (!vencimento) return "a_vencer";
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVencimento = new Date(vencimento);
  dataVencimento.setHours(0, 0, 0, 0);
  
  return dataVencimento < hoje ? "vencido" : "a_vencer";
};

export const calcularDiasAtraso = (vencimento: string | null | undefined): number => {
  if (!vencimento) return 0;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVencimento = new Date(vencimento);
  dataVencimento.setHours(0, 0, 0, 0);
  
  const diffTime = hoje.getTime() - dataVencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};
