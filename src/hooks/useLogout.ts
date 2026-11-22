import { useCallback } from "react";
import { pushService } from "@/services/pushService";

export function useLogout() {
  return useCallback(async () => {
    try {
      await pushService.unsubscribe();

      const logoutUrl = process.env.NODE_ENV === "development" ? "/logout" : "/api/logout";
      await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
        redirect: "follow",
      });
    } catch (error) {
      console.error("Выход не удался", error);
    } finally {
      window.location.href = "/";
    }
  }, []);
}
