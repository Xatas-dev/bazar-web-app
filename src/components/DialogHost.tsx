import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveDialog, useDialogStore } from "@/lib/dialogs";
import mainBlackNoLogo from "@/static/main-black-no-log.svg";
import mainWhiteNoLogo from "@/static/main-white-no-logo.svg";

/** Renders `confirmDialog()` / `promptDialog()` requests. Mounted once in `App`. */
export function DialogHost() {
  const request = useDialogStore((s) => s.request);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (request?.kind === "prompt") setValue(request.options.defaultValue ?? "");
  }, [request]);

  const handleOpenChange = (open: boolean) => {
    if (!open) resolveDialog(request?.kind === "prompt" ? null : false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!request) return;
    if (request.kind === "prompt") {
      const trimmed = value.trim();
      if (!trimmed) return;
      resolveDialog(trimmed);
    } else {
      resolveDialog(true);
    }
  };

  const options = request?.options;
  const destructive = request?.kind === "confirm" && request.options.destructive;
  const showLogo = request?.kind === "prompt" && request.options.logo;

  return (
    <Dialog open={!!request} onOpenChange={handleOpenChange}>
      {/* Phones: anchored near the top so the keyboard never covers the field */}
      <DialogContent className="w-[calc(100%-2rem)] rounded-lg max-sm:top-[12%] max-sm:translate-y-0">
        {options ? (
          <form onSubmit={handleSubmit} className="grid gap-4">
            {showLogo ? (
              // Same light/dark logo pair as the desktop welcome card
              <div className="flex justify-center pt-2">
                <img src={mainWhiteNoLogo} alt="Bazar Space" className="hidden h-14 w-auto dark:block" />
                <img src={mainBlackNoLogo} alt="Bazar Space" className="h-14 w-auto dark:hidden" />
              </div>
            ) : null}
            <DialogHeader className={showLogo ? "text-center" : "pr-6 text-left"}>
              <DialogTitle className="leading-snug">{options.title}</DialogTitle>
              {options.description ? (
                <DialogDescription>{options.description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">{options.title}</DialogDescription>
              )}
            </DialogHeader>

            {request?.kind === "prompt" ? (
              <Input
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={request.options.placeholder}
                aria-label={request.options.placeholder ?? request.options.title}
                enterKeyHint="done"
              />
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="h-11 sm:h-10" onClick={() => handleOpenChange(false)}>
                {options.cancelLabel ?? "Отмена"}
              </Button>
              <Button
                type="submit"
                variant={destructive ? "destructive" : "default"}
                className="h-11 sm:h-10"
                autoFocus={request?.kind === "confirm"}
                disabled={request?.kind === "prompt" && !value.trim()}
              >
                {options.confirmLabel ?? (destructive ? "Удалить" : "ОК")}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
