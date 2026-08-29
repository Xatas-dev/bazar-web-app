import { Button } from "@/components/ui/button";

import mainBlackLogo from "@/static/main-black.svg";
import mainWhiteLogo from "@/static/main-white.svg";

import config from "@/config";

export default function GuestPage() {
  const loginUrl = process.env.NODE_ENV === 'development'
        ? config.auth.targetLocal
        : config.auth.keycloakUrl;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="surface-panel-strong flex w-full max-w-sm flex-col items-center gap-8 rounded-lg p-10">
        <img
          src={mainWhiteLogo}
          alt="Bazar Space"
          className="hidden w-36 max-w-full dark:block"
        />
        <img
          src={mainBlackLogo}
          alt="Bazar Space"
          className="w-36 max-w-full dark:hidden"
        />
        <p className="text-sm text-muted-foreground">
          Войдите в систему, чтобы продолжить.
        </p>
        <Button asChild size="lg" className="w-full">
          <a href={loginUrl}>Войти</a>
        </Button>
      </div>
    </div>
  );
}
