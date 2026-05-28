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
          Welcome to Bazar Space
        </h1>
        <p className="text-xl text-muted-foreground">
          The flexible, modern, and secure platform for managing your digital spaces.
          Connect, collaborate, and grow with a system designed for the future.
        </p>
        <div className="pt-4">
          <a href={loginUrl}>
             <Button size="lg" className="h-12 px-8 text-lg gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
             </Button>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <Card className="transition-colors">
          <CardHeader>
            <Zap className="h-10 w-10 text-warning mb-2" />
            <CardTitle>Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
             Built with the latest tech stack including React, Vite, and Spring Cloud Gateway for optimal performance.
          </CardContent>
        </Card>

        <Card className="transition-colors">
          <CardHeader>
            <ShieldCheck className="h-10 w-10 text-success mb-2" />
            <CardTitle>Secure by Design</CardTitle>
          </CardHeader>
          <CardContent>
             Enterprise-grade security using OAuth2/OIDC handled seamlessly by our Gateway. Your data is safe.
          </CardContent>
        </Card>

        <Card className="transition-colors">
          <CardHeader>
            <Globe className="h-10 w-10 text-info mb-2" />
            <CardTitle>Global Spaces</CardTitle>
          </CardHeader>
          <CardContent>
             Create and manage spaces that can scale. Future-proof architecture ready for new modules.
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
