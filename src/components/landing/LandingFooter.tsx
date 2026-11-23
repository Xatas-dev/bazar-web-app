import { Github } from "lucide-react";
import { LandingLogo } from "./LandingLogo";

const REPO_URL = "https://github.com/Xatas-dev";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-shell border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <LandingLogo />
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Исходный код на GitHub
          </a>
          <p>© {year} Bazar Space</p>
          <p className="text-xs">* Гигл — от англ. giggle («хихиканье»)</p>
        </div>
      </div>
    </footer>
  );
}
