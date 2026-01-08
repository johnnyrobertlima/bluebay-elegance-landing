import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, User, ShoppingCart, Shield, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAdminNotifications, AdminNotification, NotificationType, NotificationCategory } from '@/hooks/useAdminNotifications';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getCategoryIcon = (category: NotificationCategory | null) => {
  switch (category) {
    case 'user':
      return <User className="h-3 w-3" />;
    case 'order':
      return <ShoppingCart className="h-3 w-3" />;
    case 'security':
      return <Shield className="h-3 w-3" />;
    default:
      return null;
  }
};

const getCategoryColor = (category: NotificationCategory | null) => {
  switch (category) {
    case 'user':
      return 'bg-blue-500/10 text-blue-500';
    case 'order':
      return 'bg-green-500/10 text-green-500';
    case 'security':
      return 'bg-red-500/10 text-red-500';
    case 'system':
      return 'bg-gray-500/10 text-gray-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

interface NotificationItemProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={cn(
        'p-3 border-b last:border-b-0 transition-colors',
        notification.is_read ? 'bg-background' : 'bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getTypeIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{notification.title}</span>
            {notification.category && (
              <Badge variant="outline" className={cn('text-xs px-1.5 py-0', getCategoryColor(notification.category))}>
                {getCategoryIcon(notification.category)}
                <span className="ml-1">{notification.category}</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
          <span className="text-xs text-muted-foreground/70 mt-1 block">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useAdminNotifications();

  if (!isAdmin) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Ler todas
              </Button>
            )}
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => clearAll()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
