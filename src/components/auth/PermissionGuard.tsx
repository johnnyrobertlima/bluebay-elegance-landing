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
  resourcePath,
  fallbackPath = "/auth",
}) => {
  const { user, loading, userRoles, isAdmin, allowedPaths } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Check if user is authenticated
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 2. Identify resource to check
  // If no specific resourcePath, we allow access (usually for shared layouts)
  if (!resourcePath) {
    return <>{children}</>;
  }

  // 3. Admin bypass
  if (isAdmin) {
    return <>{children}</>;
  }

  // 4. Dynamic Path Check
  // We check if the resourcePath (or any of its parents) is in the allowed list
  // or if the resourcePath itself is explicitly allowed.
  const isAllowed = allowedPaths.some(path =>
    resourcePath === path || resourcePath.startsWith(path + "/")
  );

  if (!isAllowed) {
    console.warn(`[PermissionGuard] Access denied to ${resourcePath}`);
    return <Navigate to="/" replace />;
  }

  // Access Granted
  return <>{children}</>;
};

export default PermissionGuard;
