import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, Inbox, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { JoinRequestsTabSkeleton } from "./JoinRequestsTabSkeleton";
import { useApproveJoinRequests, useJoinRequests, useRejectJoinRequests } from "@/hooks/useJoinRequests";
import { toast } from "@/hooks/use-toast";
import { confirmDialog } from "@/lib/dialogs";
import { formatJoinDate } from "@/lib/join";
import { cn } from "@/lib/utils";
import type { JoinRequestDto, JoinRequestsSelectionRequest } from "@/types/space";

interface JoinRequestsTabProps {
  spaceId: number;
}

const requestAuthorName = (request: JoinRequestDto) =>
  request.user.displayName || request.user.username || "Пользователь";

const initialsOf = (name: string) => name.trim().substring(0, 2).toUpperCase() || "??";

export default function JoinRequestsTab({ spaceId }: JoinRequestsTabProps) {
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isFetchNextPageError } =
    useJoinRequests(spaceId);
  const approveMutation = useApproveJoinRequests();
  const rejectMutation = useRejectJoinRequests();
  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  const requests = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const loadedPages = data?.pages.length ?? 0;
  // Bound once here: inside JSX branches TS narrows the query-result union so far that fetchNextPage becomes `never`
  const loadNextPage = () => void fetchNextPage();

  // Infinite scroll: a sentinel after the last card loads the next page as it nears the bottom of
  // the drawer's scroll area. The observer is rebuilt after every page, and a fresh observer reports
  // the current intersection right away, so a first page that doesn't fill the panel keeps loading.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void fetchNextPage();
      },
      {
        root: sentinel.closest("[data-radix-scroll-area-viewport]"),
        rootMargin: "0px 0px 300px 0px",
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, loadedPages]);
  const total = data?.pages[0]?.total ?? 0;

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // Requests handled elsewhere (or by another moderator) drop out of the selection automatically
  const selected = useMemo(
    () => requests.filter((r) => selectedIds.has(r.id)).map((r) => r.id),
    [requests, selectedIds]
  );

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const approve = (selection: JoinRequestsSelectionRequest) =>
    approveMutation.mutate(
      { spaceId, ...selection },
      {
        onSuccess: ({ approvedCount }) => {
          setSelectedIds(new Set());
          toast({
            title: "Заявки приняты",
            description: `Новых участников: ${approvedCount}.`,
          });
        },
      }
    );

  const reject = (selection: JoinRequestsSelectionRequest) =>
    rejectMutation.mutate(
      { spaceId, ...selection },
      {
        onSuccess: ({ rejectedCount }) => {
          setSelectedIds(new Set());
          toast({
            title: "Заявки отклонены",
            description: `Отклонено заявок: ${rejectedCount}.`,
          });
        },
      }
    );

  const handleApproveAll = async () => {
    const confirmed = await confirmDialog({
      title: "Принять все заявки?",
      description: `Все ${total} пользователей станут участниками спейса.`,
      confirmLabel: "Принять все",
    });
    if (confirmed) approve({ all: true });
  };

  const handleRejectAll = async () => {
    const confirmed = await confirmDialog({
      title: "Отклонить все заявки?",
      description: "Пользователи смогут отправить заявку повторно по ссылке-приглашению.",
      confirmLabel: "Отклонить все",
      destructive: true,
    });
    if (confirmed) reject({ all: true });
  };

  const handleRejectSelected = async () => {
    const confirmed = await confirmDialog({
      title: `Отклонить выбранные заявки (${selected.length})?`,
      description: "Пользователи смогут отправить заявку повторно по ссылке-приглашению.",
      confirmLabel: "Отклонить",
      destructive: true,
    });
    if (confirmed) reject({ requestIds: selected });
  };

  if (isLoading) return <JoinRequestsTabSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">Не удалось загрузить заявки.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Заявки ({total})</h3>
        <p className="text-sm text-muted-foreground">
          Пользователи, которые хотят вступить в спейс по ссылке-приглашению.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="surface-panel flex flex-col items-center gap-3 rounded-lg px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Inbox className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Новых заявок нет</p>
            <p className="text-sm text-muted-foreground">
              Поделитесь ссылкой-приглашением во вкладке «Обзор», чтобы позвать людей.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Phones: actions as a 2-column grid of 44px touch targets; desktop: right-aligned */}
          <div className="flex sm:justify-end">
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              {selected.length > 0 ? (
                <>
                  <Button size="sm" variant="outline" className="h-11 gap-2 sm:h-9" disabled={isMutating} onClick={handleRejectSelected}>
                    {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Отклонить
                  </Button>
                  <Button
                    size="sm"
                    className="h-11 gap-2 sm:h-9"
                    disabled={isMutating}
                    onClick={() => approve({ requestIds: selected })}
                  >
                    {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Принять ({selected.length})
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="h-11 gap-2 sm:h-9" disabled={isMutating} onClick={handleRejectAll}>
                    {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Отклонить все
                  </Button>
                  <Button size="sm" className="h-11 gap-2 sm:h-9" disabled={isMutating} onClick={handleApproveAll}>
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCheck className="h-4 w-4" />
                    )}
                    Принять все
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Desktop: two cards per row like the members list; phones: one compact row per request */}
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Заявки на вступление">
            <AnimatePresence initial={false}>
              {requests.map((request) => {
                const name = requestAuthorName(request);
                const isSelected = selectedIds.has(request.id);
                return (
                  <motion.li
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {/* The whole card toggles selection: a 16px checkbox alone is too small a target on phones */}
                    <div
                      onClick={() => !isMutating && toggleOne(request.id, !isSelected)}
                      className={cn(
                        "surface-panel flex h-full cursor-pointer select-none items-center gap-2 rounded-lg p-1.5 pl-3 transition-colors",
                        "sm:flex-col sm:items-stretch sm:justify-between sm:gap-3 sm:p-3",
                        isSelected && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <Checkbox
                          className="h-5 w-5 sm:h-4 sm:w-4"
                          onClick={(e) => e.stopPropagation()}
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleOne(request.id, checked === true)}
                          disabled={isMutating}
                          aria-label={`Выбрать заявку от ${name}`}
                        />
                        <Avatar className="h-11 w-11 shrink-0">
                          {request.user.avatarUrl ? (
                            <AvatarImage src={request.user.avatarUrl} alt={name} className="object-cover" />
                          ) : null}
                          <AvatarFallback>{initialsOf(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{name}</span>
                          {request.user.username && request.user.displayName && (
                            <span className="block truncate text-xs text-muted-foreground max-sm:hidden">
                              {request.user.username}
                            </span>
                          )}
                          <span className="block truncate text-xs text-muted-foreground">
                            {formatJoinDate(request.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Icon-only on phones, labelled half-width buttons in the desktop card */}
                      <div className="flex shrink-0 gap-2 sm:grid sm:grid-cols-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isMutating}
                          onClick={(e) => {
                            e.stopPropagation();
                            reject({ requestIds: [request.id] });
                          }}
                          aria-label={`Отклонить заявку от ${name}`}
                          className="h-11 w-11 gap-2 px-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <X className="h-4 w-4" />
                          <span className="max-sm:hidden">Отклонить</span>
                        </Button>
                        <Button
                          size="sm"
                          disabled={isMutating}
                          onClick={(e) => {
                            e.stopPropagation();
                            approve({ requestIds: [request.id] });
                          }}
                          aria-label={`Принять заявку от ${name}`}
                          className="h-11 w-11 gap-2 px-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Check className="h-4 w-4" />
                          <span className="max-sm:hidden">Принять</span>
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {hasNextPage && (
            <div ref={sentinelRef} className="flex min-h-11 items-center justify-center pt-2">
              {isFetchNextPageError ? (
                <Button variant="outline" className="h-11 w-full sm:h-10 sm:w-auto" onClick={loadNextPage}>
                  Не удалось загрузить заявки. Повторить
                </Button>
              ) : (
                <span
                  role="status"
                  className={cn(
                    "flex items-center gap-2 text-sm text-muted-foreground transition-opacity",
                    !isFetchingNextPage && "opacity-0"
                  )}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загружаем ещё заявки…
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
