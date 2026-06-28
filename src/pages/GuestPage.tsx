import { Button } from "@/components/ui/button";

import config from "@/config";

export default function GuestPage() {
  const loginUrl = process.env.NODE_ENV === 'development'
        ? config.auth.targetLocal
        : config.auth.keycloakUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Bazar Space</h1>
        <p className="text-sm text-muted-foreground">Войдите в систему, чтобы продолжить.</p>
      </div>
      <a href={loginUrl}>
        <Button>Войти</Button>
      </a>
    </div>
  );
}
