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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acesso Negado</h2>
          <p className="max-w-md mx-auto">Você não tem permissão para acessar este recurso.</p>
          <p className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded inline-block">{resourcePath}</p>
        </div>
      </div>
    );
  }

  // Access Granted
  return <>{children}</>;
};

export default PermissionGuard;
