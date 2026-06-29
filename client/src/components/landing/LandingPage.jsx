import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  Building2,
  Check,
  ChevronDown,
  History,
  Home,
  Menu,
  Palette,
  Sofa,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import {
  PLANS,
  TRIAL_LIMIT,
  getPlanDisplayFeatures,
} from "../../constants/plans";
import { useInView, usePrefersReducedMotion } from "../../hooks/useInView";
import { applyTheme, getStoredTheme } from "../../utils/theme";
import LandingCompareSlider from "./LandingCompareSlider";
import {
  FAQ_ITEMS,
  FEATURES,
  HERO_COMPARE,
  SHOWCASE_ITEMS,
  STATS,
  STEPS,
  TESTIMONIALS,
  TRUST_LOGOS,
} from "./landingData";

const FEATURE_ICONS = {
  sofa: Sofa,
  arrow: ArrowLeftRight,
  sparkles: Sparkles,
  palette: Palette,
  home: Home,
  zap: Zap,
  history: History,
};

const NAV_LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const HERO_WORDS = ["meubler", "remplacer", "désencombrer", "valoriser"];

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  const delayClass =
    delay > 0 ? `landing-reveal-delay-${Math.min(delay, 5)}` : "";

  return (
    <div
      ref={ref}
      className={`landing-reveal ${delayClass} ${inView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_WORDS.length);
        setVisible(true);
      }, 280);
    }, 2800);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <span
      className={`inline-block min-w-[9ch] font-display italic text-estate-gradient transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {HERO_WORDS[index]}
    </span>
  );
}

function MarqueeLogos() {
  const items = [...TRUST_LOGOS, ...TRUST_LOGOS];

  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap font-display text-base font-medium text-fg-muted/70 transition-colors hover:text-accent"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function TestimonialTrack() {
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
        {items.map((t, i) => (
          <blockquote
            key={`${t.name}-${i}`}
            className="landing-card flex w-[320px] shrink-0 flex-col p-7 transition-transform hover:-translate-y-1 sm:w-[380px]"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
            <span className="mt-4 inline-block w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-estate-stone-cool">
              {t.stat}
            </span>
            <p className="mt-4 flex-1 font-display text-base italic leading-relaxed text-fg-subtle">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-6 border-t border-line pt-4">
              <div className="font-semibold text-fg">{t.name}</div>
              <div className="text-sm text-fg-muted">{t.role}</div>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const showcase = SHOWCASE_ITEMS[activeShowcase];

  useEffect(() => {
    const previous = document.documentElement.getAttribute("data-theme");
    applyTheme("light");
    return () => applyTheme(previous || getStoredTheme());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(217,165,32,0.05) 0px, rgba(217,165,32,0.05) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(0deg, rgba(217,165,32,0.05) 0px, rgba(217,165,32,0.05) 1px, transparent 1px, transparent 48px)",
        }}
        aria-hidden
      />

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-line bg-white/95 shadow-[0_4px_24px_rgba(28,43,58,0.06)] backdrop-blur-xl"
            : "border-transparent bg-deep/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <img
              src="/realstage-logo.png"
              alt="RealStage AI"
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-tight text-fg">
              RealStage AI
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm text-fg-muted transition hover:text-fg after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth"
              className="rounded-lg px-4 py-2 text-sm text-fg-subtle transition hover:text-fg"
            >
              Connexion
            </Link>
            <Link
              to="/auth?mode=signup"
              className="btn-estate-primary px-5 py-2"
            >
              Commencer gratuitement
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-fg-muted transition hover:bg-surface md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden border-t border-line bg-white transition-all duration-300 md:hidden ${
            mobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-fg-subtle hover:bg-surface"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-line" />
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-fg-subtle hover:bg-surface"
            >
              Connexion
            </Link>
            <Link
              to="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-estate-primary mt-1 px-3 py-2.5 text-center"
            >
              Commencer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <span className="landing-label inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white px-4 py-1.5 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-accent" />
                  Home staging virtuel par IA
                </span>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="landing-heading mt-6 text-4xl leading-[1.12] sm:text-5xl lg:text-[3.25rem]">
                  L&apos;IA qui sait <RotatingWord />
                  <br />
                  vos biens immobiliers
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <div className="estate-divider mt-5" />
                <p className="landing-body mt-5 max-w-lg text-lg">
                  Transformez vos annonces en quelques secondes. Conçu pour les
                  agents, mandataires et photographes qui veulent un rendu pro —
                  sans artifice.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/auth?mode=signup"
                    className="btn-estate-primary group gap-2"
                  >
                    Essayer gratuitement
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a href="#fonctionnalites" className="btn-estate-secondary">
                    Découvrir les fonctionnalités
                  </a>
                </div>
              </Reveal>

              <Reveal delay={4}>
                <p className="mt-4 flex items-center gap-2 text-sm text-fg-muted">
                  <Check className="h-4 w-4 text-accent" />
                  {TRIAL_LIMIT} générations offertes · Sans carte bancaire
                </p>
              </Reveal>
            </div>

            <Reveal delay={2} className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl" />
              <div className="relative">
                <LandingCompareSlider
                  beforeSrc={HERO_COMPARE.before}
                  afterSrc={HERO_COMPARE.after}
                  aspectClass="aspect-[4/3] sm:aspect-[5/4]"
                  autoAnimate
                  kenBurns
                />

                <div className="absolute -left-4 top-8 z-30 hidden animate-fade-up rounded-xl border border-line bg-white px-4 py-3 shadow-lg sm:block">
                  <div className="landing-label text-[10px]">Génération</div>
                  <div className="font-display text-xl font-semibold text-estate-stone-cool">
                    &lt; 15 sec
                  </div>
                </div>

                <div
                  className="absolute -right-3 bottom-10 z-30 hidden animate-fade-up rounded-xl border border-line bg-white px-4 py-3 shadow-lg sm:block"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="landing-label text-[10px]">Styles pro</div>
                  <div className="font-display text-xl font-semibold text-fg">
                    30+
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i + 1}>
                <div className="landing-card group p-5 text-center sm:text-left">
                  <div className="estate-stat-value transition-transform group-hover:scale-105">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-fg-muted">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="landing-label mb-8 text-center">
              Choisi par les professionnels de l&apos;immobilier
            </p>
            <MarqueeLogos />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="landing-label">Le constat terrain</p>
            <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
              Vos photos vous représentent.
              <br />
              <span className="text-fg-muted">
                Même quand elles sont mauvaises.
              </span>
            </h2>
            <p className="landing-body mt-5 text-lg">
              80 % des visuels immobiliers dégradent la perception du bien. Le
              bon home staging est subtil — il révèle sans déguiser.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal delay={1}>
              <div className="h-full rounded-2xl border border-red-200 bg-red-50/60 p-6 transition hover:-translate-y-1 sm:p-8">
                <span className="landing-label text-red-500/80">Cliché</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-fg">
                  Ce qu&apos;on voit partout
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    "Pièces vides sans projection",
                    "Photos sombres ou mal cadrées",
                    "Désordre qui masque les volumes",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-fg-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="h-full rounded-2xl border border-accent/50 bg-white p-6 shadow-[0_8px_32px_rgba(217,165,32,0.18)] transition hover:-translate-y-1 sm:p-8">
                <span className="landing-label">Intelligent</span>
                <h3 className="mt-3 font-display text-xl font-semibold text-fg">
                  Ce que font les pros
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    "Interventions minimalistes et ciblées",
                    "Respect de la lumière et des volumes réels",
                    "Crédibilité → visites qualifiées",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-fg-subtle"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="fonctionnalites"
          className="border-t border-line bg-surface/50 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="landing-label">Notre savoir-faire</p>
              <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
                Votre studio IA de{" "}
                <span className="italic text-accent">home staging</span>
              </h2>
              <p className="landing-body mt-4 text-lg">
                Du meublage virtuel au désencombrement, chaque outil est pensé
                pour des visuels à la hauteur de vos biens.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <Reveal key={feature.title} delay={(i % 3) + 1}>
                    <div className="landing-card group h-full p-6 transition duration-300 hover:-translate-y-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-surface text-accent transition group-hover:border-accent/40 group-hover:bg-accent/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-fg">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="landing-label">Avant / Après</p>
            <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
              Le home staging du futur
              <br />
              <span className="text-fg-muted">en 15 secondes</span>
            </h2>
            <p className="landing-body mt-4 text-lg">
              La transformation se joue en un glissement. RealStage automatise
              les détails qui font toute la différence.
            </p>
          </Reveal>

          <Reveal delay={1} className="mt-10 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-1 rounded-xl border border-line bg-white p-1 shadow-sm">
              {SHOWCASE_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveShowcase(index)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeShowcase === index
                      ? "bg-navy text-white shadow-md"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={2} className="mx-auto mt-8 max-w-3xl">
            <div key={showcase.id}>
              <LandingCompareSlider
                beforeSrc={showcase.before}
                afterSrc={showcase.after}
                autoAnimate
                kenBurns
              />
            </div>
          </Reveal>
        </section>

        <section
          id="comment-ca-marche"
          className="border-t border-line bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="landing-label">Processus</p>
              <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
                Comment ça fonctionne ?
              </h2>
              <p className="landing-body mt-4 text-lg">
                Quatre étapes simples, zéro compétence technique requise.
              </p>
            </Reveal>

            <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-px bg-line lg:block" />

              {STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i + 1}>
                  <div className="group relative text-center lg:text-left">
                    <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-white font-display text-sm font-bold text-fg shadow-sm transition group-hover:border-navy group-hover:bg-navy group-hover:text-white lg:mx-0">
                      {step.step}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-fg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-t border-line bg-surface/40 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <p className="landing-label">Témoignages</p>
            <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
              Ce que disent nos utilisateurs
            </h2>
            <p className="mt-3 text-fg-muted">Survolez pour mettre en pause</p>
          </Reveal>

          <div className="mt-12">
            <TestimonialTrack />
          </div>
        </section>

        <section
          id="tarifs"
          className="border-t border-line bg-white py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="landing-label">Tarification</p>
              <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
                Tarification simple
              </h2>
              <p className="landing-body mt-4 text-lg">
                {TRIAL_LIMIT} générations gratuites à l&apos;inscription, puis
                choisissez le forfait adapté à votre activité.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.id} delay={i + 1}>
                  <div
                    className={`relative flex h-full flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 sm:p-8 ${
                      plan.popular
                        ? "border-accent bg-white shadow-[0_12px_40px_rgba(217,165,32,0.22)]"
                        : "landing-card"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">
                        Populaire
                      </span>
                    )}

                    <h3 className="font-display text-lg font-semibold text-fg">
                      {plan.label}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-semibold text-fg">
                        {plan.priceMonthly} €
                      </span>
                      <span className="text-sm text-fg-muted">/ mois</span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {getPlanDisplayFeatures(plan).map((feature, index) => (
                        <li
                          key={`${feature}-${index}`}
                          className={`flex items-start gap-2 text-sm ${
                            index === 0 && plan.id !== "starter"
                              ? "font-semibold text-estate-stone-cool"
                              : "text-fg-subtle"
                          }`}
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/auth?mode=signup"
                      className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition hover:scale-[1.02] ${
                        plan.popular
                          ? "btn-estate-primary"
                          : "btn-estate-secondary"
                      }`}
                    >
                      Commencer
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={2}>
              <p className="mt-8 text-center text-sm text-fg-muted">
                Résiliation libre · Sans frais cachés · Résultats instantanés
              </p>
            </Reveal>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28"
        >
          <Reveal className="text-center">
            <p className="landing-label">FAQ</p>
            <h2 className="landing-heading mt-3 text-3xl sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="landing-body mt-4 text-lg">
              À chaque problème, une solution.
            </p>
          </Reveal>

          <div className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal key={item.q} delay={(index % 3) + 1}>
                  <div
                    className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                      isOpen
                        ? "border-accent/40 bg-white shadow-md"
                        : "border-line bg-white hover:border-accent/25"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-fg transition sm:text-base"
                    >
                      {item.q}
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-fg-muted transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </button>
                    <div
                      className="grid transition-all duration-300 ease-in-out"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                      }}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-fg-muted">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-16 text-center sm:px-12">
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px)",
                  }}
                  aria-hidden
                />
                <div className="relative">
                  <p className="landing-label text-accent-light">
                    Passez à l&apos;action
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Prêt à booster vos annonces ?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
                    Rejoignez les professionnels qui transforment leurs photos
                    en quelques clics. {TRIAL_LIMIT} essais gratuits, sans
                    engagement.
                  </p>
                  <Link
                    to="/auth?mode=signup"
                    className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-sm font-semibold text-fg shadow-xl transition hover:scale-105 hover:bg-accent-light"
                  >
                    Commencer maintenant
                    <ArrowRight className="h-4 w-4 animate-bounce-x" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy/20 bg-navy text-white/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/realstage-logo.png"
                  alt="RealStage AI"
                  className="h-8 w-8 object-contain brightness-110"
                />
                <span className="font-display font-semibold text-white">
                  RealStage AI
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-white/60">
                Home staging virtuel par IA pour professionnels de
                l&apos;immobilier.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="landing-label text-accent-light">Produit</h4>
                <ul className="mt-3 space-y-2">
                  {[
                    { href: "#fonctionnalites", label: "Fonctionnalités" },
                    { href: "#tarifs", label: "Tarifs" },
                    { href: "#faq", label: "FAQ" },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="landing-label text-accent-light">Compte</h4>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      to="/auth"
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/auth?mode=signup"
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      Créer un compte
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="landing-label text-accent-light">
                  Fonctionnalités
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-white/60">
                  <li>Meubler IA</li>
                  <li>Remplacer le mobilier</li>
                  <li>Vider</li>
                  <li>30+ styles</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} RealStage AI. Tous droits réservés.
            </p>
            <p className="text-sm text-white/40">
              Votre home staging virtuel en 15 secondes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
