import { useEffect } from "react";

/**
 * Keeps `--app-height` equal to the visible viewport height.
 *
 * iOS Safari does not shrink `100dvh` when the on-screen keyboard opens, so a
 * full-height shell would leave the chat composer hidden under the keyboard.
 * The visual viewport does shrink, so the app shell sizes itself from it.
 */
export function useAppViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    const update = () => {
      // Ignore pinch-zoom: only keyboard / browser-chrome changes should resize the shell
      if (Math.abs(viewport.scale - 1) > 0.01) return;
      root.style.setProperty("--app-height", `${Math.round(viewport.height)}px`);
      // iOS pans the page to reveal a focused field; the shell already fits, so undo the pan
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    update();
    viewport.addEventListener("resize", update);
    return () => {
      viewport.removeEventListener("resize", update);
      root.style.removeProperty("--app-height");
    };
  }, []);
}
