"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import mainBlackLogo from "@/static/main-black-no-log.svg";
import mainWhiteLogo from "@/static/main-white-no-logo.svg";

import config from "@/config";

/* ---------- Icons ---------- */

function CheckIcon({ className = "" }: { className?: string }) {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
  );
}

function ChatIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
  );
}

function StorageIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
  );
}

function PuzzleIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
      >
        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-1.033-.558-1.01-1.073.05-.336.163-.677.303-.917L11.107 2.9a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
      </svg>
  );
}

function WarningIcon() {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
  );
}

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
      >
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .3.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
      </svg>
  );
}

/* ---------- Data ---------- */

const features = [
  {
    title: "Чат",
    description:
        "Личные диалоги и общие каналы с удобной лентой сообщений. Всё, что нужно для живого общения внутри спейса.",
    icon: <ChatIcon />,
  },
  {
    title: "Хранилище",
    description:
        "Загружайте файлы, систематизируйте их и делитесь с участниками спейса — без лишних сложностей.",
    icon: <StorageIcon />,
  },
  {
    title: "Модульность",
    description:
        "Подключайте только то, что нужно вашему спейсу. Список модулей будет расширяться в будущих релизах.",
    icon: <PuzzleIcon />,
  },
];

const checklist = [
  "Включайте и отключайте модули под задачи спейса",
  "Настраивайте пространство под команду или сообщество",
  "Новые модули появятся в будущих релизах",
];

const spaceModules = [
  { name: "Чат", enabled: true },
  { name: "Хранилище", enabled: true },
  { name: "Новый модуль", enabled: false },
  { name: "Новый модуль", enabled: false },
];

const sections = [
  { id: "modules", label: "Модули" },
  { id: "modularity", label: "Модульность" },
  { id: "disclaimer", label: "Важно знать" },
] as const;

/* ---------- Page ---------- */

export default function GuestPage() {
  const loginUrl =
      process.env.NODE_ENV === "development"
          ? config.auth.targetLocal
          : config.auth.keycloakUrl;

  const repoUrl = "https://github.com/Xatas-dev";

  const [active, setActive] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const updateState = () => {
      setIsScrolled(window.scrollY > 8);

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= docHeight - 4) {
        setActive(sections[sections.length - 1].id);
        return;
      }

      const offset = window.innerHeight * 0.35;
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= offset) current = section.id;
      }
      setActive(current);
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateState();
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
      <div className="flex min-h-screen flex-col">
        {/* Left-side floating section nav (desktop) */}
        <nav
            aria-label="Разделы страницы"
            className="pointer-events-none fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 pl-8 xl:block 2xl:pl-12"
        >
          <ul className="pointer-events-auto flex flex-col items-start gap-1.5">
            {sections.map((section) => {
              const isActive = active === section.id;
              return (
                  <li key={section.id}>
                    <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className="group flex items-center justify-start gap-4 py-2.5"
                    >
                  <span
                      className={cn(
                          "block h-1 rounded-full transition-all duration-300 ease-out",
                          isActive
                              ? "w-14 bg-primary"
                              : "w-6 bg-border group-hover:w-10 group-hover:bg-muted-foreground/60"
                      )}
                  />
                      <span
                          className={cn(
                              "whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out",
                              "-translate-x-1 opacity-0",
                              "group-hover:translate-x-0 group-hover:opacity-100",
                              isActive && "translate-x-0 2xl:opacity-100"
                          )}
                      >
                    {section.label}
                  </span>
                    </a>
                  </li>
              );
            })}
          </ul>
        </nav>

        {/* Header */}
        <header
            className={cn(
                "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
                isScrolled
                    ? "border-border/60 bg-background/70 backdrop-blur-xl"
                    : "border-border bg-background"
            )}
        >
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2">
              <img
                  src={mainWhiteLogo}
                  alt="Bazar Space"
                  className="hidden h-8 w-auto dark:block"
              />
              <img
                  src={mainBlackLogo}
                  alt="Bazar Space"
                  className="h-8 w-auto dark:hidden"
              />
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Bazar Space
            </span>
            </a>

            <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex xl:hidden">
              {sections.map((section) => (
                  <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={cn(
                          "transition-colors hover:text-foreground",
                          active === section.id && "text-foreground"
                      )}
                  >
                    {section.label}
                  </a>
              ))}
            </nav>

            <Button asChild size="sm">
              <a href={loginUrl}>Войти</a>
            </Button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero */}
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
            <div className="flex max-w-3xl flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Open Source · Модульная соцсеть
            </span>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Ваш спейс —{" "}
                <span className="text-primary">ваши правила</span>
              </h1>

              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Bazar Space — любительская open-source соцсеть с модульной
                системой. Подключайте нужные модули, настраивайте пространство
                под себя и общайтесь с теми, кто вам близок.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href={loginUrl}>Войти в систему</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    <GitHubIcon className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Команда разработки очень старалась — попробуйте и вы ❤️
              </p>
            </div>
          </section>

          {/* Modules */}
          <section
              id="modules"
              className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24"
          >
            <div className="mb-8 flex max-w-2xl flex-col gap-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Что уже внутри
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Сейчас в приложении два рабочих модуля. Список будет расширяться —
                и вы сможете собрать собственный набор для своего спейса.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                  <div
                      key={feature.title}
                      className="surface-panel flex flex-col gap-4 rounded-lg p-6 transition-colors hover:border-primary/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          {/* Modularity */}
          <section
              id="modularity"
              className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24"
          >
            <div className="surface-panel-strong grid gap-8 rounded-lg p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Модули — под ваш спейс
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Bazar Space строится вокруг модулей. Сейчас доступны «Чат» и
                  «Хранилище», а дальше — больше. Каждый спейс сможет включать
                  только те модули, которые ему нужны: никакого лишнего
                  функционала, только то, чем вы реально пользуетесь.
                </p>
                <ul className="mt-2 space-y-2.5 text-sm text-muted-foreground">
                  {checklist.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                  ))}
                </ul>
              </div>

              <div className="surface-panel-muted rounded-lg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Мой спейс</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  2 / 4
                </span>
                </div>
                <ul className="space-y-2">
                  {spaceModules.map((module, index) => (
                      <li
                          key={`${module.name}-${index}`}
                          className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                      <span
                          className={cn(
                              "h-2 w-2 rounded-full",
                              module.enabled
                                  ? "bg-primary"
                                  : "bg-muted-foreground/40"
                          )}
                      />
                          <span
                              className={
                                module.enabled ? "" : "text-muted-foreground"
                              }
                          >
                        {module.name}
                      </span>
                        </div>
                        <span
                            className={
                              module.enabled
                                  ? "text-xs text-primary"
                                  : "text-xs text-muted-foreground"
                            }
                        >
                      {module.enabled ? "Вкл" : "Скоро"}
                    </span>
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section
              id="disclaimer"
              className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24"
          >
            <div className="surface-panel-strong rounded-lg border-warning/40 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning">
                  <WarningIcon />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Важно знать</h2>
                  <p className="text-sm text-muted-foreground">
                    Bazar Space — любительский open-source проект. Мы не несём
                    ответственности за сохранность вашей информации. На текущем
                    этапе данные не шифруются, хотя пароли хранятся в
                    зашифрованном виде. Приложение не собирает персональную
                    информацию и не использует её для аналитики.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
            <div className="surface-panel-strong flex flex-col items-start gap-4 rounded-lg p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold sm:text-2xl">
                  Готовы попробовать?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Войдите, чтобы создать свой спейс и подключить первые модули.
                </p>
              </div>
              <Button asChild size="lg">
                <a href={loginUrl}>Войти</a>
              </Button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Bazar Space · Любительский open-source
              проект
            </p>
            <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              github.com/Xatas-dev
            </a>
          </div>
        </footer>
      </div>
  );
}