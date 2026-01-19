import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: AppRole[];
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await (supabase as any)
        .rpc('has_app_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user?.id,
  });

  // Get current user's roles
  const { data: currentUserRoles, isLoading: isLoadingCurrentRoles } = useQuery({
    queryKey: ['current-user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await (supabase as any)
        .from('app_user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching current user roles:', error);
        return [];
      }
      
      return (data as UserRole[]).map(r => r.role);
    },
    enabled: !!user?.id,
  });

  // Get all users with their roles (admin only)
  const { data: usersWithRoles, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, created_at');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Then get all roles
      const { data: roles, error: rolesError } = await (supabase as any)
        .from('app_user_roles')
        .select('*');
      
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      // Map roles to users
      const rolesMap = new Map<string, AppRole[]>();
      (roles as UserRole[]).forEach(role => {
        const existing = rolesMap.get(role.user_id) || [];
        rolesMap.set(role.user_id, [...existing, role.role]);
      });

      // Combine profiles with roles
      const usersWithRoles: UserWithRoles[] = (profiles as any[]).map((profile: any) => ({
        id: profile.id,
        email: '', // Will be fetched separately if needed
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: rolesMap.get(profile.id) || [],
      }));

      return usersWithRoles;
    },
    enabled: isAdmin === true,
  });

  // Add role to user
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await (supabase as any)
        .from('app_user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin'] });
      toast.success('Role adicionada com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error adding role:', error);
      toast.error('Erro ao adicionar role: ' + error.message);
    },
  });

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await (supabase as any)
        .from('app_user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin'] });
      toast.success('Role removida com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error removing role:', error);
      toast.error('Erro ao remover role: ' + error.message);
    },
  });

  return {
    isAdmin,
    isCheckingAdmin,
    currentUserRoles,
    isLoadingCurrentRoles,
    usersWithRoles,
    isLoadingUsers,
    refetchUsers,
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
};
