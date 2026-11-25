import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Search, UserPlus, UserX, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddUserToSpace } from "@/hooks/useSpaces";
import { USER_SEARCH_MIN_LENGTH, useSearchUsers } from "@/hooks/useUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserDtoResponseV2 } from "@/types/api";

interface AddMemberSearchProps {
  spaceId: number;
  memberUserIds: ReadonlySet<string>;
}

const PANEL_MOTION = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.15, ease: "easeOut" },
} as const;

const nameOf = (user: UserDtoResponseV2) => user.displayName || user.username;
const initialsOf = (name: string) => name.substring(0, 2).toUpperCase() || "??";

/** "ещё 1 символ" / "ещё 2 символа" */
const charsLeftLabel = (left: number) => `ещё ${left} ${left === 1 ? "символ" : "символа"}`;

const ResultRowSkeleton = () => (
  <li className="flex items-center gap-3 p-2">
    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-11 w-11 shrink-0 rounded-md sm:h-9 sm:w-28" />
  </li>
);

export function AddMemberSearch({ spaceId, memberUserIds }: AddMemberSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, 300);

  const { data: results, isFetching } = useSearchUsers(debouncedTerm);
  const addUserMutation = useAddUserToSpace();
  // Several people can be added in a row; track each row on its own
  const [addingIds, setAddingIds] = useState<ReadonlySet<string>>(new Set());
  // Bridges the gap between a successful add and the refreshed member list
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(new Set());

  const isLongEnough = term.length >= USER_SEARCH_MIN_LENGTH;
  const isSearching = isLongEnough && (term !== debouncedTerm || isFetching);

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && query) {
      event.preventDefault();
      setQuery("");
    } else if (event.key === "Enter") {
      // Phones: hide the keyboard so the results are visible
      event.currentTarget.blur();
    }
  };

  const handleAdd = (user: UserDtoResponseV2) => {
    const update = (set: ReadonlySet<string>, add: boolean) => {
      const next = new Set(set);
      if (add) next.add(user.id);
      else next.delete(user.id);
      return next;
    };

    setAddingIds((prev) => update(prev, true));
    addUserMutation.mutate(
      { spaceId, userId: user.id },
      {
        onSuccess: () => {
          setAddedIds((prev) => update(prev, true));
          toast({ title: "Участник добавлен", description: `${nameOf(user)} теперь в спейсе.` });
        },
        onSettled: () => setAddingIds((prev) => update(prev, false)),
      }
    );
  };

  const renderPanel = () => {
    if (!term) return null;

    if (!isLongEnough) {
      return (
        <motion.p key="hint" {...PANEL_MOTION} className="px-1 text-sm text-muted-foreground">
          Введите {charsLeftLabel(USER_SEARCH_MIN_LENGTH - term.length)}, чтобы начать поиск
        </motion.p>
      );
    }

    // First search: no previous results to keep on screen
    if (!results || (results.length === 0 && isSearching)) {
      return (
        <motion.ul key="loading" {...PANEL_MOTION} aria-hidden className="surface-panel divide-y divide-border rounded-lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <ResultRowSkeleton key={i} />
          ))}
        </motion.ul>
      );
    }

    if (results.length === 0 && !isSearching) {
      return (
        <motion.div
          key="empty"
          {...PANEL_MOTION}
          className="surface-panel flex flex-col items-center gap-3 rounded-lg px-6 py-8 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserX className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Никого не нашли</p>
            <p className="text-sm text-muted-foreground">
              По запросу «{term}» пользователей нет. Проверьте написание или попробуйте логин.
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.ul
        key="results"
        {...PANEL_MOTION}
        aria-label="Найденные пользователи"
        aria-busy={isSearching}
        className={cn(
          "surface-panel divide-y divide-border overflow-hidden rounded-lg transition-opacity",
          isSearching && "opacity-60"
        )}
      >
        {results.map((user) => {
          const name = nameOf(user);
          const isMember = memberUserIds.has(user.id) || addedIds.has(user.id);
          const isAdding = addingIds.has(user.id);

          return (
            <li key={user.id} className="flex items-center gap-3 p-2">
              <Avatar className="h-11 w-11 shrink-0">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={name} className="object-cover" /> : null}
                <AvatarFallback>{initialsOf(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{name}</span>
                {user.displayName && user.username && (
                  <span className="block truncate text-xs text-muted-foreground">{user.username}</span>
                )}
              </div>

              {isMember ? (
                <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-success sm:h-9">
                  <Check className="h-4 w-4" />
                  В спейсе
                </span>
              ) : (
                <Button
                  size="sm"
                  disabled={isAdding}
                  onClick={() => handleAdd(user)}
                  aria-label={`Добавить ${name} в спейс`}
                  className="h-11 w-11 shrink-0 gap-2 px-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  <span className="max-sm:hidden">Добавить</span>
                </Button>
              )}
            </li>
          );
        })}
      </motion.ul>
    );
  };

  return (
    <section className="space-y-3" aria-labelledby="add-member-title">
      <div className="space-y-1">
        <h3 id="add-member-title" className="text-lg font-medium">
          Добавить участника
        </h3>
        <p className="text-sm text-muted-foreground">Найдите человека по имени или логину.</p>
      </div>

      <div className="relative px-1">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </span>
        <Input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Имя или логин"
          aria-label="Поиск пользователей"
          className="h-11 pl-10 pr-12 sm:h-10 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Очистить поиск"
            className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {renderPanel()}
      </AnimatePresence>
    </section>
  );
}
