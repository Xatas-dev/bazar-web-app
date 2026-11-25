import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Copy, Link2, Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useJoinRequests, useSpaceJoinLink } from "@/hooks/useJoinRequests";
import { toast } from "@/hooks/use-toast";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const LOCKED_HINT = "Ссылка-приглашение доступна только участникам с правом приглашать в спейс.";

/** Inset "well" that holds the link inside the card */
const wellClass =
  "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-surface-muted))] px-3 text-sm";

/** Show the host + path without the protocol: shorter and easier to scan */
const displayUrl = (url: string) => url.replace(/^https?:\/\//, "");

interface SpaceInviteLinkProps {
  spaceId: number;
  /** space_user:ADD — without it the card is shown locked and the link is never fetched */
  canInvite: boolean;
  /** Jump to the «Заявки» tab */
  onOpenRequests?: () => void;
}

/** Invite card of the space overview. Visible to everyone, usable only with space_user:ADD. */
export function SpaceInviteLink({ spaceId, canInvite, onOpenRequests }: SpaceInviteLinkProps) {
  const { data, isLoading, isError } = useSpaceJoinLink(spaceId, canInvite);
  const { data: requestsData } = useJoinRequests(spaceId, canInvite);
  const pendingCount = requestsData?.pages[0]?.total ?? 0;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!data?.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      toast({ title: "Ссылка скопирована", description: "Отправьте её тем, кого хотите пригласить." });
    } catch {
      notify.error.generic("Не удалось скопировать ссылку. Попробуйте ещё раз.");
    }
  };

  const renderLinkRow = () => {
    if (!canInvite) {
      return (
        <div className="flex select-none gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                tabIndex={0}
                role="note"
                aria-label={`Ссылка-приглашение скрыта. ${LOCKED_HINT}`}
                className={cn(
                  wellClass,
                  "cursor-not-allowed text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span aria-hidden className="truncate tracking-[0.3em] opacity-[var(--panel-disabled-opacity)]">
                  ••••••••••••••••
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-64">
              {LOCKED_HINT}
            </TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            className="h-11 gap-2 opacity-50"
            onClick={() => notify.error.forbidden()}
            aria-label="Скопировать ссылку-приглашение"
          >
            <Copy className="h-4 w-4" />
            <span className="max-sm:hidden">Копировать</span>
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-md" />
          <Skeleton className="h-11 w-11 rounded-md sm:w-32" />
        </div>
      );
    }

    if (isError || !data) {
      return <p className="text-sm text-muted-foreground">Не удалось получить ссылку-приглашение.</p>;
    }

    return (
      <div className="flex gap-2">
        <div className={wellClass} title={data.url}>
          <Link2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate font-medium text-foreground">{displayUrl(data.url)}</span>
        </div>
        <Button onClick={handleCopy} className="h-11 gap-2" aria-label="Скопировать ссылку-приглашение">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "copy"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
          <span className="max-sm:hidden">{copied ? "Скопировано" : "Копировать"}</span>
        </Button>
      </div>
    );
  };

  return (
    <section className="surface-panel space-y-4 rounded-lg p-4" aria-labelledby="space-invite-title">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <h3 id="space-invite-title" className="font-semibold">
            Пригласить участников
          </h3>
          <p className="text-sm text-muted-foreground">
            Отправьте ссылку — любой сможет подать заявку в спейс.
          </p>
        </div>
      </div>

      {renderLinkRow()}

      {canInvite && onOpenRequests && (
        <button
          type="button"
          onClick={onOpenRequests}
          className="group flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>Заявки на вступление</span>
          <span className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {pendingCount}
              </span>
            )}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      )}
    </section>
  );
}
