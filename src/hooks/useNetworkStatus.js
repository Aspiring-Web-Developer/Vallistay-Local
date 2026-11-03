import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PING_INTERVAL = 15000;

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef(null);

  const pingServer = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return false;
    }
    try {
      // no-cors: resolves as long as the request actually reaches the network/server,
      // throws only on real connectivity failure — no backend CORS setup needed
      await fetch(API_BASE_URL, { method: "GET", cache: "no-store", mode: "no-cors" });
      setIsOnline(true);
      return true;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  const retry = useCallback(async () => {
    setChecking(true);
    const ok = await pingServer();
    setChecking(false);
    return ok;
  }, [pingServer]);

  useEffect(() => {
    const handleOnline = () => pingServer();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    pingServer();
    intervalRef.current = setInterval(pingServer, PING_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalRef.current);
    };
  }, [pingServer]);

  return { isOnline, checking, retry };
}