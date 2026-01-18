import { useCallback } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function useTallyNavigationGuard(hasActiveTally: () => boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithCheck = useCallback(
    (to: string) => {
      if (location.pathname === "/" && hasActiveTally()) {
        const shouldProceed = confirm(
          "You have items in your current tally. Clear and continue?"
        );
        if (!shouldProceed) return;
      }
      navigate({ to });
    },
    [navigate, location.pathname, hasActiveTally]
  );

  return { navigateWithCheck };
}
