import { Button } from "@/components/ui/button";

import config from "@/config";

export default function GuestPage() {
  const loginUrl = process.env.NODE_ENV === 'development'
        ? config.auth.targetLocal
        : config.auth.keycloakUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <p className="text-sm text-muted-foreground">Войдите в систему, чтобы продолжить.</p>
      <a href={loginUrl}>
        <Button>Войти</Button>
      </a>
    </div>
  );
}
