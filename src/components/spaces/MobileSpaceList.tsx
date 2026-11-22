import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, LayoutGrid, Menu, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";
import { UserMenu } from "@/components/UserMenu";
import { useCreateSpace, useSpaces } from "@/hooks/useSpaces";
import { promptDialog } from "@/lib/dialogs";
import type { PanelHistoryState } from "@/hooks/usePanel";

const fromListState: PanelHistoryState = { fromList: true };

function MobileSpaceListSkeleton() {
  return (
    <div className="space-y-1 px-2 py-2" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-[3.25rem] w-[3.25rem] shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/** Phone home screen: the space list is the page itself, not a hidden menu. */
export function MobileSpaceList() {
  const { data, isLoading } = useSpaces();
  const createSpace = useCreateSpace();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const spaces = useMemo(() => data?.spaces ?? [], [data]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? spaces.filter((space) => space.name.toLowerCase().includes(query)) : spaces;
  }, [search, spaces]);

  const handleCreate = async () => {
    const name = await promptDialog({
      logo: true,
      title: "Новый спейс",
      placeholder: "Название спейса",
      confirmLabel: "Создать",
    });
    if (!name) return;
    createSpace.mutate(name, {
      onSuccess: (space) => navigate(`/spaces/${space.id}`, { state: fromListState }),
    });
  };


  return (
    // One continuous shell surface: header and list share the same background
    <div className="surface-shell flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2 px-2 py-2">
        <UserMenu
          onCreateSpace={handleCreate}
          trigger={
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Открыть меню">
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <h1 className="shrink-0 text-xl font-bold">Спейсы</h1>
        {spaces.length > 0 ? (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск"
              aria-label="Поиск спейса"
              enterKeyHint="search"
              className="h-10 pl-9"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          onClick={handleCreate}
          disabled={createSpace.isPending}
          aria-label="Создать спейс"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <MobileSpaceListSkeleton />
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="surface-panel-muted rounded-full p-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Пока нет спейсов</h2>
              <p className="text-sm text-muted-foreground">Создайте первый спейс, чтобы общаться и делиться файлами.</p>
            </div>
            <Button size="lg" className="h-12 w-full max-w-xs" onClick={handleCreate} disabled={createSpace.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              Создать спейс
            </Button>
          </div>
        ) : (
          <nav aria-label="Спейсы" className="space-y-0.5 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            {filtered.map((space) => (
              <Link
                key={space.id}
                to={`/spaces/${space.id}`}
                state={fromListState}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SpaceAvatar
                  name={space.name}
                  avatarUrl={space.avatarUrl}
                  className="h-[3.25rem] w-[3.25rem] shrink-0"
                  fallbackClassName="text-sm"
                />
                <span className="min-w-0 flex-1 truncate text-base font-medium">{space.name}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
            {search.trim() && filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Спейсы не найдены.</p>
            ) : null}
          </nav>
        )}
      </div>
    </div>
  );
}
