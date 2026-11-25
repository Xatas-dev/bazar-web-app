import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Link2Off, Loader2, Moon, Send, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";
import { LandingLogo } from "@/components/landing/LandingLogo";
import JoinSpacePageSkeleton from "@/pages/JoinSpacePageSkeleton";
import { useCreateJoinRequest, useSpacePreview } from "@/hooks/useJoinRequests";
import { useUserStore } from "@/store/userStore";
import { useThemeStore } from "@/store/themeStore";
import { notify } from "@/lib/notifications";
import {
  clearPendingJoinCode,
  getLoginUrl,
  getPendingJoinCode,
  setPendingJoinCode,
} from "@/lib/join";

const statusOf = (error: unknown) => (isAxiosError(error) ? error.response?.status : undefined);

function JoinHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const themeLabel = theme === "light" ? "Тёмная тема" : "Светлая тема";

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link to="/" aria-label="Bazar Space — на главную">
        <LandingLogo />
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={themeLabel}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{themeLabel}</TooltipContent>
      </Tooltip>
    </header>
  );
}

function InvalidInvite() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
        <Link2Off className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Приглашение недействительно</h1>
        <p className="text-muted-foreground">
          Ссылка устарела или содержит ошибку. Попросите участника спейса прислать новую.
        </p>
      </div>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/">На главную</Link>
      </Button>
    </div>
  );
}

export default function JoinSpacePage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  // Read the session RootLayout already resolved; a second useUser() observer would refetch
  // the failed iam query on mount and loop for guests
  const user = useUserStore((s) => s.user);
  const isAuthenticated = !!user;

  const { data: space, isLoading, error } = useSpacePreview(code);
  const joinMutation = useCreateJoinRequest();

  const alreadyMember = statusOf(joinMutation.error) === 409;
  const requestSentAt = joinMutation.data?.createdAt;

  const sendRequest = () => {
    joinMutation.mutate(code, {
      onError: (err) => {
        const status = statusOf(err);
        if (status === 409) return; // shown inline
        if (status === 404) {
          notify.error.generic("Спейс по этой ссылке не найден.");
        } else if (status === 401) {
          notify.error.unauthorized();
        } else {
          notify.error.generic("Не удалось отправить заявку. Попробуйте ещё раз.");
        }
      },
    });
  };

  // Returning from login after pressing "Отправить заявку" as a guest: send it automatically, once.
  // The stored intent is consumed as soon as an authenticated user lands here, even if the invite is invalid.
  const autoSend = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isAuthenticated || autoSend.current !== null) return;
    autoSend.current = getPendingJoinCode() === code;
    clearPendingJoinCode();
  }, [isAuthenticated, code]);

  useEffect(() => {
    if (!isAuthenticated || !space || !autoSend.current) return;
    autoSend.current = false;
    sendRequest();
    // sendRequest is recreated each render; this effect must only fire once per invite
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, space, code]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      setPendingJoinCode(code);
      window.location.href = getLoginUrl();
      return;
    }
    sendRequest();
  };

  const isNotFound = !!error && (statusOf(error) === 404 || statusOf(error) === 400);

  const renderBody = () => {
    if (isLoading) return <JoinSpacePageSkeleton />;
    if (isNotFound || !space) {
      if (error && !isNotFound) {
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Не удалось загрузить приглашение</h1>
            <p className="text-muted-foreground">Проверьте подключение и попробуйте ещё раз.</p>
            <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
              Обновить
            </Button>
          </div>
        );
      }
      return <InvalidInvite />;
    }

    return (
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="w-40 pt-4 sm:w-48">
          <SpaceAvatar
            name={space.name}
            avatarUrl={space.avatarUrl}
            shape="squircle"
            glow
            className="aspect-square h-auto w-full"
            fallbackClassName="text-5xl"
          />
        </div>

        <div className="space-y-2">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Вас пригласили в спейс
          </p>
          <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">{space.name}</h1>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {requestSentAt ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-4"
            >
              <div className="surface-panel flex w-full items-start gap-3 rounded-lg p-4 text-left">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div className="space-y-1">
                  <p className="font-semibold">Заявка отправлена</p>
                  <p className="text-sm text-muted-foreground">
                    Спейс появится в вашем списке, когда заявку одобрят.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => navigate("/spaces")}>
                К моим спейсам
              </Button>
            </motion.div>
          ) : alreadyMember ? (
            <motion.div
              key="member"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-4"
            >
              <p className="text-muted-foreground">Вы уже участник этого спейса.</p>
              <Button className="group gap-2 rounded-full px-6" onClick={() => navigate("/spaces")}>
                Открыть спейсы
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-3"
            >
              <Button
                size="lg"
                className="w-full gap-2 rounded-full sm:w-auto sm:px-10"
                onClick={handleJoin}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Отправить заявку
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <JoinHeader />
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="surface-panel w-full max-w-md rounded-lg px-6 py-10 sm:px-10"
          aria-label="Приглашение в спейс"
        >
          {renderBody()}
        </motion.section>
      </main>
    </div>
  );
}
