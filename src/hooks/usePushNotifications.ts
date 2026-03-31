import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { apiUrl } from "../services/apiConfig";

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function usePushNotifications() {
  const { getToken, isSignedIn } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [supported] = useState(
    () => "serviceWorker" in navigator && "PushManager" in window && !!VAPID_KEY,
  );

  useEffect(() => {
    if (!supported || !isSignedIn) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setEnabled(!!sub);
      });
    });
  }, [supported, isSignedIn]);

  const subscribe = useCallback(async () => {
    if (!supported || !isSignedIn) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
      }

      const token = await getToken();
      await fetch(apiUrl("/api/push/subscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sub.toJSON()),
      });

      setEnabled(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  }, [supported, isSignedIn, getToken]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setEnabled(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [supported]);

  return { supported, enabled, subscribe, unsubscribe };
}
