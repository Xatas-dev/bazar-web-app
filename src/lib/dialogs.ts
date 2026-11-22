import { create } from "zustand";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface PromptOptions {
  /** Show the Bazar Space logo above the title (e.g. creating a space) */
  logo?: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type DialogRequest =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

interface DialogStore {
  request: DialogRequest | null;
}

export const useDialogStore = create<DialogStore>(() => ({ request: null }));

const settlePending = () => {
  const pending = useDialogStore.getState().request;
  if (!pending) return;
  if (pending.kind === "confirm") pending.resolve(false);
  else pending.resolve(null);
};

/** Styled replacement for `window.confirm`. Rendered by `<DialogHost />`. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  settlePending();
  return new Promise((resolve) => {
    useDialogStore.setState({ request: { kind: "confirm", options, resolve } });
  });
}

/** Styled replacement for `window.prompt`. Resolves to the trimmed value, or `null` if cancelled. */
export function promptDialog(options: PromptOptions): Promise<string | null> {
  settlePending();
  return new Promise((resolve) => {
    useDialogStore.setState({ request: { kind: "prompt", options, resolve } });
  });
}

export function resolveDialog(value: boolean | string | null) {
  const pending = useDialogStore.getState().request;
  if (!pending) return;
  useDialogStore.setState({ request: null });
  if (pending.kind === "confirm") pending.resolve(value === true);
  else pending.resolve(typeof value === "string" ? value : null);
}
