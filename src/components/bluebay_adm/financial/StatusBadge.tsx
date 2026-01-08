
import React from "react";
import { Badge } from "@/components/ui/badge";
import { XCircle, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | null = null;
  let label = status;
  let customClass = "";
  let icon = null;
  
  switch (status) {
    case "1":
      variant = "outline";
      label = "Em Aberto";
      customClass = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      break;
    case "2":
      variant = "outline";
      label = "Parcialmente Pago";
      customClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "3":
      variant = "outline";
      label = "Pago";
      customClass = "bg-green-100 text-green-800 hover:bg-green-100";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "4":
      variant = "outline";
      label = "Cancelado";
      customClass = "bg-red-100 text-red-800 hover:bg-red-100";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case "VENCIDO":
      variant = "outline";
      label = "Vencido";
      customClass = "bg-red-100 text-red-800 hover:bg-red-100";
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge 
      variant={variant} 
      className={customClass}
    >
      <span className="flex items-center">
        {icon}
        {label}
      </span>
    </Badge>
  );
};
