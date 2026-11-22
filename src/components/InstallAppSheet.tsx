import { useEffect, type ComponentType, type ReactNode } from "react";
import { Bell, Download, Maximize2, Share, SquarePlus, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BREAKPOINTS, useMediaQuery } from "@/hooks/useMediaQuery";
import {
  getInstallPlatform,
  promptInstall,
  rememberInstallDismissed,
  usePwaInstallStore,
  wasInstallDismissedRecently,
} from "@/lib/pwaInstall";

/** Delay before suggesting the install, so it never greets the user on first paint */
const AUTO_OPEN_DELAY_MS = 4000;
let autoOpenedThisSession = false;

function Benefit({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </li>
  );
}

function IosStep({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {index}
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

const inlineIconClass = "mx-1 inline h-4 w-4 -translate-y-px align-middle text-primary";

/**
 * "Установить Bazar" bottom sheet (phones only).
 * Android/Chromium: real install button. iOS: Share → «На экран „Домой"» instructions.
 */
export function InstallAppSheet() {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const { deferredPrompt, isStandalone, isIos, sheetOpen, setSheetOpen } = usePwaInstallStore();
  const platform = getInstallPlatform({ deferredPrompt, isStandalone, isIos });

  // Suggest once per session on phones, unless dismissed recently or already installed
  useEffect(() => {
    if (isDesktop || platform === "unsupported" || autoOpenedThisSession || wasInstallDismissedRecently()) return;
    const timer = window.setTimeout(() => {
      autoOpenedThisSession = true;
      setSheetOpen(true);
    }, AUTO_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isDesktop, platform, setSheetOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) rememberInstallDismissed();
    setSheetOpen(open);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) rememberInstallDismissed();
    setSheetOpen(false);
  };

  if (platform === "unsupported") return null;

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[90dvh] max-w-lg flex-col gap-5 overflow-y-auto rounded-t-lg px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:mb-6 sm:rounded-lg sm:border"
      >
        <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />

        <div className="flex items-center gap-4">
          <img
            src="/icons/icon-192.png"
            alt=""
            className="h-16 w-16 shrink-0 rounded-[var(--space-avatar-radius)] border border-[hsl(var(--panel-border-strong))]"
          />
          <div className="min-w-0 space-y-1">
            <SheetTitle className="text-xl">Установите Bazar Space</SheetTitle>
            <SheetDescription>Приложение на экране «Домой» — без адресной строки и магазина приложений.</SheetDescription>
          </div>
        </div>

        <ul className="space-y-2.5">
          <Benefit icon={Zap}>Запуск в одно касание</Benefit>
          <Benefit icon={Maximize2}>Полноэкранный режим, как у обычного приложения</Benefit>
          <Benefit icon={Bell}>Уведомления о новых сообщениях</Benefit>
        </ul>

        {platform === "prompt" ? (
          <div className="flex flex-col gap-2">
            <Button size="lg" className="h-12 gap-2 rounded-full" onClick={handleInstall}>
              <Download className="h-4 w-4" />
              Установить
            </Button>
            <Button variant="ghost" size="lg" className="h-12 rounded-full" onClick={() => handleOpenChange(false)}>
              Не сейчас
            </Button>
          </div>
        ) : (
          <>
            <ol className="surface-panel space-y-3 rounded-lg p-4" aria-label="Как установить на iPhone">
              <IosStep index={1}>
                Нажмите
                <Share className={inlineIconClass} aria-label="«Поделиться»" />
                «Поделиться» в панели Safari
              </IosStep>
              <IosStep index={2}>
                Выберите
                <SquarePlus className={inlineIconClass} aria-hidden />
                «На экран „Домой“»
              </IosStep>
              <IosStep index={3}>Нажмите «Добавить» в правом верхнем углу</IosStep>
            </ol>
            <Button variant="outline" size="lg" className="h-12 rounded-full" onClick={() => handleOpenChange(false)}>
              Понятно
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
