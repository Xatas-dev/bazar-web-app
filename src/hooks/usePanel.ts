import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type PanelName = "profile" | "space-settings";
export type SettingsTab = "overview" | "members" | "roles";
export type RoleScreen =
  | { kind: "list" }
  | { kind: "info"; roleId: number }
  | { kind: "editor"; roleId?: number; fromInfo?: boolean };

/**
 * Side panels (profile, space settings and its nested role screens) live in the
 * history entry's state instead of a global store. Every screen you drill into
 * is a real history entry, so the Android back button, the browser back gesture
 * and desktop "Back" all step out of panels one level at a time, and the URL
 * stays clean.
 */
export interface PanelHistoryState {
  panel?: PanelName;
  settingsTab?: SettingsTab;
  roleScreen?: RoleScreen;
  /** How many history entries were pushed since the panel opened */
  panelDepth?: number;
  /** Set when a space was opened from the mobile space list, so "back" can pop instead of push */
  fromList?: boolean;
}

export function usePanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = useMemo(() => (location.state ?? {}) as PanelHistoryState, [location.state]);

  const here = useMemo(
    () => ({ pathname: location.pathname, search: location.search, hash: location.hash }),
    [location.pathname, location.search, location.hash]
  );

  const open = useCallback(
    (panel: PanelName) => {
      if (state.panel === panel) return;
      const next: PanelHistoryState = { fromList: state.fromList, panel };
      if (state.panel) {
        // Switching panels keeps the same history depth
        navigate(here, { replace: true, state: { ...next, panelDepth: state.panelDepth } });
      } else {
        navigate(here, { state: { ...next, panelDepth: 1 } });
      }
    },
    [here, navigate, state]
  );

  /** Drill one level deeper inside the open panel (adds a history entry). */
  const push = useCallback(
    (patch: Omit<PanelHistoryState, "panel" | "panelDepth" | "fromList">) => {
      navigate(here, { state: { ...state, ...patch, panelDepth: (state.panelDepth ?? 0) + 1 } });
    },
    [here, navigate, state]
  );

  /** Change the current panel screen without a new history entry (e.g. switching tabs). */
  const replace = useCallback(
    (patch: Omit<PanelHistoryState, "panel" | "panelDepth" | "fromList">) => {
      navigate(here, { replace: true, state: { ...state, ...patch } });
    },
    [here, navigate, state]
  );

  const close = useCallback(() => {
    const depth = state.panelDepth ?? 0;
    if (depth > 0) {
      navigate(-depth);
    } else {
      navigate(here, { replace: true, state: { fromList: state.fromList } });
    }
  }, [here, navigate, state]);

  /** One level up: back to the previous panel screen, or close the panel from its root screen. */
  const back = useCallback(() => {
    if ((state.panelDepth ?? 0) > 0) {
      navigate(-1);
    } else {
      close();
    }
  }, [close, navigate, state.panelDepth]);

  return { state, active: state.panel ?? null, open, push, replace, back, close };
}
