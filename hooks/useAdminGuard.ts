import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants";

/**
 * Redirect non-admins away from admin screens.
 * Returns { ready } — render nothing until ready=true.
 */
export const useAdminGuard = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      if (!userStr) {
        router.replace("/(auth)/login");
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN") {
        router.replace("/(tabs)/");
        return;
      }
      setReady(true);
    })();
  }, []);

  return { ready };
};
