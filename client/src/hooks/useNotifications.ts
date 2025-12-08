import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Este navegador não suporta notificações");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notificações ativadas!");
        return true;
      } else if (result === "denied") {
        toast.error("Permissão de notificações negada");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Erro ao solicitar permissão de notificações");
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: "Notification" in window,
    isGranted: permission === "granted",
  };
}
