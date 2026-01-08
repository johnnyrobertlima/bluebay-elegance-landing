
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandToggleProps {
  isExpanded: boolean;
  className?: string;
}

export const ExpandToggle: React.FC<ExpandToggleProps> = ({ isExpanded, className = "" }) => {
  return isExpanded ? (
    <ChevronUp className={`h-4 w-4 ${className}`} />
  ) : (
    <ChevronDown className={`h-4 w-4 ${className}`} />
  );
};
