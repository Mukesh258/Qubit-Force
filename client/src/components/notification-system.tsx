import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Add welcome notification when component mounts
    const timer = setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'System Ready',
        message: 'Quantum security protocols initialized',
        duration: 3000
      });
    }, 1000);

    // Listen for custom events to show notifications
    const handleNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    window.addEventListener('show-notification', handleNotification as EventListener);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('show-notification', handleNotification as EventListener);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border max-w-md animate-in slide-in-from-right ${getStyles(notification.type)}`}
          data-testid={`notification-${notification.type}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-current hover:opacity-70 flex-shrink-0"
              data-testid={`button-close-notification-${notification.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Utility function to show notifications from anywhere in the app
export const showNotification = (notification: Omit<Notification, 'id'>) => {
  const event = new CustomEvent('show-notification', { detail: notification });
  window.dispatchEvent(event);
};
