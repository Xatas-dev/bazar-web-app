import { create } from "zustand";

/** Chromium's install prompt event (not in the TS DOM lib). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallPlatform = "ios" | "prompt" | "unsupported";

interface PwaInstallState {
  /** Saved `beforeinstallprompt` event (Android / desktop Chromium) */
  deferredPrompt: BeforeInstallPromptEvent | null;
  /** Already running as an installed app */
  isStandalone: boolean;
  isIos: boolean;
  /** Install sheet visibility */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
/** After "Не сейчас" the sheet stays quiet for two weeks (the menu item still works) */
const DISMISS_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const detectStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

// iPadOS reports itself as a Mac, so also check for touch
const detectIos = () =>
  typeof navigator !== "undefined" &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1));

export const usePwaInstallStore = create<PwaInstallState>((set) => ({
  deferredPrompt: null,
  isStandalone: detectStandalone(),
  isIos: detectIos(),
  sheetOpen: false,
  setSheetOpen: (open) => set({ sheetOpen: open }),
}));

/** How this device can install the app, if at all. */
export function getInstallPlatform(state: Pick<PwaInstallState, "deferredPrompt" | "isStandalone" | "isIos">): InstallPlatform {
  if (state.isStandalone) return "unsupported";
  if (state.deferredPrompt) return "prompt";
  if (state.isIos) return "ios";
  return "unsupported";
}

export function wasInstallDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw !== null && Date.now() - Number(raw) < DISMISS_SNOOZE_MS;
  } catch {
    return false;
  }
}

export function rememberInstallDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage unavailable (private mode): the sheet may show again next visit
  }
}

/** Opens the system install dialog (Chromium). Resolves to true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const { deferredPrompt } = usePwaInstallStore.getState();
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // A prompt event can only be used once
  usePwaInstallStore.setState({ deferredPrompt: null });
  return outcome === "accepted";
}

let initialized = false;

/**
 * Call once before React renders: `beforeinstallprompt` can fire very early,
 * and a listener attached later would miss it.
 */
export function initPwaInstall() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the browser's mini-infobar from showing; we offer our own sheet
    event.preventDefault();
    usePwaInstallStore.setState({ deferredPrompt: event as BeforeInstallPromptEvent });
  });

  window.addEventListener("appinstalled", () => {
    usePwaInstallStore.setState({ deferredPrompt: null, sheetOpen: false });
  });

  window.matchMedia("(display-mode: standalone)").addEventListener("change", (event) => {
    usePwaInstallStore.setState({ isStandalone: event.matches });
  });
}
