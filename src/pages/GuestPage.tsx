import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import config from "@/config";

export default function GuestPage() {
  const loginUrl = process.env.NODE_ENV === 'development'
        ? config.auth.targetLocal
        : config.auth.keycloakUrl;

  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-20 px-4">

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-primary pb-2">
          Добро пожаловать в Bazar Space
        </h1>
        <p className="text-xl text-muted-foreground">
          Гибкая, современная и безопасная платформа для управления вашими цифровыми пространствами.
          Общайтесь, сотрудничайте и развивайтесь с системой, созданной для будущего.
        </p>
        <div className="pt-4">
          <a href={loginUrl}>
             <Button size="lg" className="h-12 px-8 text-lg gap-2">
                Начать <ArrowRight className="h-5 w-5" />
             </Button>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <Card className="transition-colors">
          <CardHeader>
            <Zap className="h-10 w-10 text-warning mb-2" />
            <CardTitle>Молниеносная скорость</CardTitle>
          </CardHeader>
          <CardContent>
             Создан на современном стеке технологий: React, Vite и Spring Cloud Gateway для максимальной производительности.
          </CardContent>
        </Card>

        <Card className="transition-colors">
          <CardHeader>
            <ShieldCheck className="h-10 w-10 text-success mb-2" />
            <CardTitle>Безопасность по дизайну</CardTitle>
          </CardHeader>
          <CardContent>
             Безопасность корпоративного уровня с использованием OAuth2/OIDC, обрабатываемая нашим шлюзом. Ваши данные в безопасности.
          </CardContent>
        </Card>

        <Card className="transition-colors">
          <CardHeader>
            <Globe className="h-10 w-10 text-info mb-2" />
            <CardTitle>Глобальные спейсы</CardTitle>
          </CardHeader>
          <CardContent>
             Создавайте и управляйте масштабируемыми спейсами. Архитектура готова к новым модулям.
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
