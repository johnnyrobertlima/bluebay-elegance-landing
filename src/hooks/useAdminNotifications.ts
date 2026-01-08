import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'user' | 'order' | 'system' | 'security';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  metadata: Record<string, unknown>;
}

export const useAdminNotifications = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      return data as AdminNotification[];
    },
    enabled: isAdmin === true,
  });

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Todas as notificações foram removidas');
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          toast.info(newNotification.title, {
            description: newNotification.message,
          });
          queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  return {
    notifications,
    isLoading,
    unreadCount,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearAll: clearAllMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isClearing: clearAllMutation.isPending,
  };
};
