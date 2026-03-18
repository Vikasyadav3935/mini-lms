import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import {
  cancelInactivityReminder,
  scheduleInactivityReminder,
} from "@/lib/notifications";
import { appStorage } from "@/lib/storage";

interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? null;

      setIsConnected(connected);
      setIsInternetReachable(reachable);

      if (!connected && !wasOffline.current) {
        wasOffline.current = true;
      }
    });

    setupInactivityTracking();

    return () => unsubscribe();
  }, []);

  const setupInactivityTracking = async () => {
    const lastActive = await appStorage.getLastActive();
    if (lastActive) {
      const diff = Date.now() - new Date(lastActive).getTime();
      const hoursSinceActive = diff / (1000 * 60 * 60);
      if (hoursSinceActive > 20) {
        await scheduleInactivityReminder();
      }
    }
    await appStorage.setLastActive();
    await cancelInactivityReminder();
  };

  return (
    <NetworkContext.Provider value={{ isConnected, isInternetReachable }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
