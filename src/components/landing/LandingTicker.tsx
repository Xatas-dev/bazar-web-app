const HASHTAGS = [
  "хай_неписота_ток_тссс",
  "новый_макс",
  "леха_не_захотел_программировать",
  "базар",
  "чем_ближе_т***_империи_тем_безумнее_ее_****ны",
  "сказал_базар_зарегистрируйся",
  "АААААААААААААААА",
  "фиксики_рофлят_над_беднягой_мешком",
  "курьёз",
  "алиса_я_хочу_ср***",
  "обстановка_по_хатам",
  "прямой_кефир",
  "роуди_сдался",
  "все_уже_зарегистрировались_один_ты_остался",
];

/** Endless hashtag ticker; the list is rendered twice so the loop is seamless */
export function LandingTicker() {
  return (
    <div className="surface-shell landing-marquee-mask overflow-hidden border-y py-5">
      <ul className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        {[...HASHTAGS, ...HASHTAGS].map((tag, i) => (
          <li
            key={`${tag}-${i}`}
            aria-hidden={i >= HASHTAGS.length}
            className="whitespace-nowrap text-lg font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="text-primary">#</span>
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
