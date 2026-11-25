import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Blocks,
  Code2,
  Download,
  FolderOpen,
  FolderTree,
  Github,
  MessagesSquare,
  Reply,
  ShieldAlert,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingTicker } from "@/components/landing/LandingTicker";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingSponsors } from "@/components/landing/LandingSponsors";
import { GlowOrb, Reveal, SpotlightCard, Stagger, StaggerItem } from "@/components/landing/LandingMotion";
import { cn } from "@/lib/utils";

import { getLoginUrl } from "@/lib/auth";

interface AboutPoint {
  icon: typeof MessagesSquare;
  title: string;
  text: string;
  link?: { href: string; label: string };
}

const ABOUT_POINTS: AboutPoint[] = [
  {
    icon: Code2,
    title: "Открытый код",
    text: "Весь исходный код доступен на GitHub — его можно изучить, развернуть у себя или улучшить.",
    link: { href: "https://github.com/Xatas-dev", label: "Открыть GitHub" },
  },
  {
    icon: Blocks,
    title: "Модульная архитектура",
    text: "Каждая функция — отдельный сервис. Модули(оснафка) подключаются к спейсу и развиваются независимо.",
  },
  {
    icon: Users,
    title: "Спейсы и роли",
    text: "Создавайте спейсы для друзей, приглашайте близких и сами решайте, кому что доступно.",
  },
];

const DISCLAIMER_POINTS = [
  "Мы не несём ответственности за персональные данные, которые вы размещаете в приложении.",
  "Сообщения защищены только базовым шифрованием — не передавайте через Bazar Space чувствительную информацию.",
  "Это любительский проект без гарантий доступности и сохранности данных.",
];

interface Feature {
  icon: typeof MessagesSquare;
  title: string;
  text: string;
}

const CHAT_FEATURES: Feature[] = [
  { icon: Zap, title: "Мгновенная доставка", text: "Сообщения приходят в реальном времени — без обновления страницы." },
  { icon: Reply, title: "Ответы и правки", text: "Отвечайте на конкретные сообщения, редактируйте и удаляйте свои." },
  { icon: SmilePlus, title: "Реакции", text: "Отмечайте сообщения реакциями и смотрите, кто отреагировал." },
  { icon: Bell, title: "Уведомления", text: "Push-уведомления о новых сообщениях, даже когда вкладка закрыта." },
];

const STORAGE_FEATURES: Feature[] = [
  { icon: FolderTree, title: "Папки(мамки)", text: "Раскладывайте файлы по папкам и перемещайте их между ними." },
  { icon: Upload, title: "Загрузка", text: "Фото, видео и документы — всё хранится рядом с перепиской." },
  { icon: Download, title: "Скачивание", text: "Любой файл спейса можно скачать в один клик." },
  { icon: ShieldCheck, title: "Доступ по ролям", text: "Кто может смотреть и загружать файлы, решают роли спейса." },
];

interface SectionProps {
  id: string;
  className?: string;
  children: ReactNode;
}

function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("relative isolate mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 md:py-28", className)}>
      {children}
    </section>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: string }) {
  return (
    <Reveal className="flex max-w-2xl flex-col gap-4">
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
      {text && <p className="text-lg text-muted-foreground">{text}</p>}
    </Reveal>
  );
}

function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, text }) => (
        <StaggerItem key={title}>
          <SpotlightCard className="gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

interface ModuleSectionProps {
  id: string;
  icon: typeof MessagesSquare;
  eyebrow: string;
  title: string;
  text: string;
  features: Feature[];
  reversed?: boolean;
}

/** Module description: big heading with an icon on one side, feature cards on the other */
function ModuleSection({ id, icon: Icon, eyebrow, title, text, features, reversed }: ModuleSectionProps) {
  return (
    <Section
      id={id}
      className={cn(
        "grid items-center gap-10 md:gap-16",
        reversed ? "md:grid-cols-[1.25fr_1fr]" : "md:grid-cols-[1fr_1.25fr]"
      )}
    >
      <GlowOrb
        className={cn("top-1/4 h-96 w-96", reversed ? "-left-20" : "-right-20")}
        variant={reversed ? "secondary" : "primary"}
      />
      <div className={cn("flex flex-col gap-6", reversed && "md:order-2")}>
        <Reveal from={reversed ? "right" : "left"}>
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <Icon className="h-8 w-8" />
          </span>
        </Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} text={text} />
      </div>
      <div className={cn(reversed && "md:order-1")}>
        <FeatureGrid items={features} />
      </div>
    </Section>
  );
}

export default function GuestPage() {
  const loginUrl = getLoginUrl();

  return (
    <div id="top" className="flex min-h-dvh flex-col overflow-x-clip">
      <LandingHeader loginUrl={loginUrl} />

      <main className="flex-1">
        <LandingHero loginUrl={loginUrl} />

        <LandingTicker />

        {/* About */}
        <Section id="principles" className="pt-12 md:pt-16">
          <Stagger className="grid gap-4 md:grid-cols-3">
            {ABOUT_POINTS.map(({ icon: Icon, title, text, link }) => (
              <StaggerItem key={title}>
                <SpotlightCard>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="text-muted-foreground">{text}</p>
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto flex w-fit items-center gap-2 pt-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      <Github className="h-4 w-4" />
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  )}
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>

        {/* Disclaimer */}
        <Section id="disclaimer" className="py-0 md:py-0">
          <Reveal>
            <div
              role="note"
              className="flex flex-col gap-5 rounded-lg border border-warning/50 bg-warning/10 p-6 sm:flex-row sm:gap-6 sm:p-8"
            >
              <motion.span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning"
                whileInView={{ rotate: [0, -12, 10, -6, 0] }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <ShieldAlert className="h-6 w-6" />
              </motion.span>
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Важно знать перед регистрацией</h2>
                <ul className="flex flex-col gap-2 text-muted-foreground">
                  {DISCLAIMER_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* Modules */}
        <Section id="modules" className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="Модули(оснафка)"
            title={<>Подключайте только <span className="landing-gradient-text animate-gradient-pan">то, что нужно</span></>}
            text="Каждый спейс собирается из модулей(оснафки). Сейчас доступны два(две), и мы работаем над новыми."
          />
          <Stagger className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <SpotlightCard href="#chat">
                <ModuleIcon icon={MessagesSquare} />
                <h3 className="text-xl font-bold">Чат</h3>
                <p className="text-muted-foreground">Переписка с друзьями в реальном времени.</p>
                <MoreLink />
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem>
              <SpotlightCard href="#storage">
                <ModuleIcon icon={FolderOpen} />
                <h3 className="text-xl font-bold">Хранилище</h3>
                <p className="text-muted-foreground">Общие файлы и папки спейса.</p>
                <MoreLink />
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-lg border-2 border-dashed border-[hsl(var(--panel-border-strong))] p-6">
                <motion.span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-muted-foreground">Новые модули(оснафка)</h3>
                  <Badge variant="secondary">Скоро</Badge>
                </div>
                <p className="text-muted-foreground">Мы продолжаем развивать платформу — следите за обновлениями.</p>
              </div>
            </StaggerItem>
          </Stagger>
        </Section>

        <ModuleSection
          id="chat"
          icon={MessagesSquare}
          eyebrow="Чат"
          title="Общение без задержек"
          text="У каждого спейса есть свой чат. Сообщения приходят мгновенно, а важные моменты легко отметить реакцией или ответом."
          features={CHAT_FEATURES}
        />

        <ModuleSection
          id="storage"
          icon={FolderOpen}
          eyebrow="Хранилище"
          title="Все ваши файлы под рукой"
          text="Делитесь фото, документами и любыми файлами прямо в спейсе — рядом с перепиской."
          features={STORAGE_FEATURES}
          reversed
        />

        <LandingSponsors />
      </main>

      <LandingFooter />
    </div>
  );
}

function ModuleIcon({ icon: Icon }: { icon: typeof MessagesSquare }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
      <Icon className="h-6 w-6" />
    </span>
  );
}

function MoreLink() {
  return (
    <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-primary">
      Подробнее
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  );
}
