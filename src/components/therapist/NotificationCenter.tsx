import { Bell, Heart, BookOpen, Smile, History, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const iconMap = {
  check_in: Smile,
  emotional_record: Heart,
  diary_entry: BookOpen,
  patient_history: History,
};

const typeLabels = {
  check_in: 'Check-in',
  emotional_record: 'Registro Emocional',
  diary_entry: 'Diário',
  patient_history: 'História',
};

interface NotificationCenterProps {
  collapsed?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ collapsed = false }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "default"}
          className={cn(
            "relative",
            !collapsed && "w-full justify-start"
          )}
        >
          <Bell className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Notificações</span>}
          {unreadCount > 0 && (
            <Badge
              className={cn(
                "h-5 min-w-5 p-0 flex items-center justify-center text-xs",
                collapsed ? "absolute -top-1 -right-1" : "ml-auto"
              )}
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="right">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
              <p className="text-xs mt-1">
                Você receberá alertas quando seus pacientes compartilharem registros
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <Link
                    key={notification.id}
                    to={`/therapist/patients/${notification.patientId}`}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted transition-colors block",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[notification.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
