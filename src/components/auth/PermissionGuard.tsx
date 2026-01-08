import React, { ReactNode } from "react";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: AppRole;
  resourcePath?: string;
  fallbackPath?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  fallbackPath = "/auth",
}) => {
  const { user, loading, userRoles, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If a specific role is required, check for it
  if (requiredRole) {
    // Admins always have access
    if (isAdmin) {
      return <>{children}</>;
    }
    
    // Check if user has the required role
    if (!userRoles.includes(requiredRole)) {
      return <Navigate to="/" replace />;
    }
  }

  // For authenticated users with any role, or if no specific role required
  return <>{children}</>;
};

export default PermissionGuard;
