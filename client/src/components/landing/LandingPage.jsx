import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
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

const HERO_WORDS = ["meubler", "désencombrer", "sublimer", "valoriser"];

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
      className={`inline-block min-w-[9ch] text-gradient-animated transition-all duration-300 ${
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
      <div className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused]">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
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
            className="card-glow flex w-[320px] shrink-0 flex-col rounded-2xl border border-zinc-800 bg-panel p-6 transition-transform hover:-translate-y-1 hover:border-zinc-700 sm:w-[360px]"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="mt-3 inline-block w-fit rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-light">
              {t.stat}
            </span>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-5 border-t border-zinc-800 pt-4">
              <div className="font-medium text-white">{t.name}</div>
              <div className="text-sm text-zinc-500">{t.role}</div>
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-deep text-white">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[600px] w-[600px] animate-float-slow rounded-full bg-accent/15 blur-[130px]" />
        <div
          className="absolute -right-32 top-1/4 h-[500px] w-[500px] animate-float-slow rounded-full bg-accent-light/10 blur-[120px]"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-indigo-600/10 blur-[100px]"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-zinc-800/90 bg-deep/95 shadow-lg shadow-black/20 backdrop-blur-xl"
            : "border-transparent bg-transparent backdrop-blur-sm"
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
              className="h-9 w-9 object-contain transition-transform group-hover:rotate-6"
            />
            <span className="text-lg font-semibold tracking-tight">
              RealStage AI
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm text-zinc-400 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-accent-light after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth"
              className="rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              Connexion
            </Link>
            <Link
              to="/auth?mode=signup"
              className="btn-shimmer rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:scale-105 hover:shadow-accent/40"
            >
              Commencer gratuitement
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 md:hidden"
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
          className={`overflow-hidden border-t border-zinc-800 bg-deep transition-all duration-300 md:hidden ${
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
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-zinc-800" />
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900"
            >
              Connexion
            </Link>
            <Link
              to="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-shimmer mt-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Commencer gratuitement
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-light shadow-lg shadow-accent/10">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-light opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-light" />
                  </span>
                  <Sparkles className="h-3.5 w-3.5" />
                  Home staging virtuel par IA
                </span>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  L&apos;IA qui sait <RotatingWord />
                  <br />
                  vos biens immobiliers
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-400">
                  Transformez vos annonces en quelques secondes. Conçu pour les
                  agents, mandataires et photographes qui veulent un rendu pro —
                  sans artifice.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/auth?mode=signup"
                    className="btn-shimmer group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent/30 transition hover:scale-[1.03] hover:shadow-accent/50"
                  >
                    Essayer gratuitement
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#fonctionnalites"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3.5 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-zinc-500 hover:bg-zinc-800"
                  >
                    Découvrir les fonctionnalités
                  </a>
                </div>
              </Reveal>

              <Reveal delay={4}>
                <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                  <Check className="h-4 w-4 text-accent-light" />
                  {TRIAL_LIMIT} générations offertes · Sans carte bancaire
                </p>
              </Reveal>
            </div>

            <Reveal delay={2} className="relative">
              <div className="absolute -inset-6 animate-pulse-glow rounded-3xl bg-gradient-to-br from-accent/30 via-transparent to-accent-light/20 blur-2xl" />
              <div className="animate-float relative">
                <LandingCompareSlider
                  beforeSrc={HERO_COMPARE.before}
                  afterSrc={HERO_COMPARE.after}
                  aspectClass="aspect-[4/3] sm:aspect-[5/4]"
                  autoAnimate
                  kenBurns
                />

                <div className="absolute -left-4 top-8 z-30 hidden animate-fade-up rounded-xl border border-zinc-700/80 bg-panel/90 px-3 py-2 shadow-xl backdrop-blur-md sm:block">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Temps de génération
                  </div>
                  <div className="text-lg font-bold text-accent-light">
                    &lt; 15 sec
                  </div>
                </div>

                <div
                  className="absolute -right-3 bottom-10 z-30 hidden animate-fade-up rounded-xl border border-zinc-700/80 bg-panel/90 px-3 py-2 shadow-xl backdrop-blur-md sm:block"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Styles disponibles
                  </div>
                  <div className="text-lg font-bold text-white">30+</div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i + 1}>
                <div className="group rounded-xl border border-zinc-800/80 bg-panel/40 p-4 text-center backdrop-blur-sm transition hover:border-accent/30 hover:bg-panel/70 sm:text-left">
                  <div className="text-2xl font-bold text-white transition-transform group-hover:scale-110 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Trust marquee */}
        <section className="border-y border-zinc-800/80 bg-panel/40 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
              Choisi par les professionnels de l&apos;immobilier
            </p>
            <MarqueeLogos />
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Vos photos vous représentent.
              <br />
              <span className="text-zinc-500">
                Même quand elles sont mauvaises.
              </span>
            </h2>
            <p className="mt-5 text-lg text-zinc-400">
              80 % des visuels immobiliers dégradent la perception du bien. Le
              bon home staging est subtil — il révèle sans déguiser.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal delay={1}>
              <div className="h-full rounded-2xl border border-red-900/40 bg-red-950/20 p-6 transition hover:-translate-y-1 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  Cliché
                </span>
                <h3 className="mt-3 text-xl font-semibold">
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
                      className="flex items-start gap-2 text-sm text-zinc-400"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="card-glow h-full rounded-2xl border border-accent/40 bg-accent/5 p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/10 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-light">
                  Intelligent
                </span>
                <h3 className="mt-3 text-xl font-semibold">
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
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section
          id="fonctionnalites"
          className="border-t border-zinc-800/80 bg-panel/30 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Votre studio IA de{" "}
                <span className="text-gradient-animated">home staging</span>
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Du meublage virtuel au désencombrement, chaque outil est pensé
                pour des visuels à la hauteur de vos biens.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <Reveal key={feature.title} delay={(i % 3) + 1}>
                    <div className="card-glow group h-full rounded-2xl border border-zinc-800 bg-panel/80 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-light/10 text-accent-light transition group-hover:scale-110 group-hover:from-accent/30">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Le home staging du futur
              <br />
              <span className="text-zinc-500">en 15 secondes</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              La transformation se joue en un glissement. RealStage automatise
              les détails qui font toute la différence.
            </p>
          </Reveal>

          <Reveal delay={1} className="mt-10 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-1 rounded-xl border border-zinc-800 bg-panel/80 p-1">
              {SHOWCASE_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveShowcase(index)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeShowcase === index
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-zinc-400 hover:text-white"
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

        {/* How it works */}
        <section
          id="comment-ca-marche"
          className="border-t border-zinc-800/80 bg-panel/30 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Comment ça fonctionne ?
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Quatre étapes simples, zéro compétence technique requise.
              </p>
            </Reveal>

            <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block" />

              {STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i + 1}>
                  <div className="group relative text-center lg:text-left">
                    <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-blue-700 text-sm font-bold text-white shadow-lg shadow-accent/30 transition group-hover:scale-110 lg:mx-0">
                      {step.step}
                      <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 opacity-0 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials marquee */}
        <section className="overflow-hidden py-20 sm:py-28">
          <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ce que disent nos utilisateurs
            </h2>
            <p className="mt-3 text-zinc-500">Survolez pour mettre en pause</p>
          </Reveal>

          <div className="mt-12">
            <TestimonialTrack />
          </div>
        </section>

        {/* Pricing */}
        <section
          id="tarifs"
          className="border-t border-zinc-800/80 bg-panel/30 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tarification simple
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                {TRIAL_LIMIT} générations gratuites à l&apos;inscription, puis
                choisissez le forfait adapté à votre activité.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.id} delay={i + 1}>
                  <div
                    className={`relative flex h-full flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-2 sm:p-8 ${
                      plan.popular
                        ? "border-accent bg-accent/5 shadow-xl shadow-accent/20 hover:shadow-accent/30"
                        : "border-zinc-800 bg-panel hover:border-zinc-700 hover:shadow-xl"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 animate-pulse-glow rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
                        Populaire
                      </span>
                    )}

                    <h3 className="text-lg font-semibold">{plan.label}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {plan.priceMonthly} €
                      </span>
                      <span className="text-sm text-zinc-500">/ mois</span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {getPlanDisplayFeatures(plan).map((feature, index) => (
                        <li
                          key={`${feature}-${index}`}
                          className={`flex items-start gap-2 text-sm ${
                            index === 0 && plan.id !== "starter"
                              ? "font-semibold text-accent-light"
                              : "text-zinc-300"
                          }`}
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/auth?mode=signup"
                      className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition hover:scale-[1.02] ${
                        plan.popular
                          ? "btn-shimmer text-white shadow-lg shadow-accent/25"
                          : "border border-zinc-700 text-white hover:bg-zinc-800"
                      }`}
                    >
                      Commencer
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={2}>
              <p className="mt-8 text-center text-sm text-zinc-500">
                Résiliation libre · Sans frais cachés · Résultats instantanés
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28"
        >
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
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
                        ? "border-accent/30 bg-panel shadow-lg shadow-accent/5"
                        : "border-zinc-800 bg-panel/80 hover:border-zinc-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition sm:text-base"
                    >
                      {item.q}
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-accent-light" : ""
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
                        <div className="border-t border-zinc-800 px-5 py-4 text-sm leading-relaxed text-zinc-400">
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

        {/* Final CTA */}
        <section className="border-t border-zinc-800/80">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-accent/30 px-6 py-16 text-center sm:px-12">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-panel to-panel" />
                <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-transparent via-accent/10 to-transparent bg-[length:200%_100%]" />
                <div className="absolute -left-20 -top-20 h-60 w-60 animate-float-slow rounded-full bg-accent/20 blur-3xl" />
                <div
                  className="absolute -bottom-20 -right-20 h-60 w-60 animate-float-slow rounded-full bg-accent-light/15 blur-3xl"
                  style={{ animationDelay: "-6s" }}
                />

                <div className="relative">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Prêt à booster vos annonces ?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-300">
                    Rejoignez les professionnels qui transforment leurs photos
                    en quelques clics. {TRIAL_LIMIT} essais gratuits, sans
                    engagement.
                  </p>
                  <Link
                    to="/auth?mode=signup"
                    className="btn-shimmer group mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-2xl shadow-accent/30 transition hover:scale-105"
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

      <footer className="border-t border-zinc-800 bg-panel/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/realstage-logo.png"
                  alt="RealStage AI"
                  className="h-8 w-8 object-contain"
                />
                <span className="font-semibold">RealStage AI</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-zinc-500">
                Home staging virtuel par IA pour professionnels de
                l&apos;immobilier.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Produit
                </h4>
                <ul className="mt-3 space-y-2">
                  {[
                    { href: "#fonctionnalites", label: "Fonctionnalités" },
                    { href: "#tarifs", label: "Tarifs" },
                    { href: "#faq", label: "FAQ" },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-zinc-400 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Compte
                </h4>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      to="/auth"
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/auth?mode=signup"
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      Créer un compte
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Fonctionnalités
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  <li>Meubler IA</li>
                  <li>Vider</li>
                  <li>30+ styles</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
            <p className="text-sm text-zinc-600">
              © {new Date().getFullYear()} RealStage AI. Tous droits réservés.
            </p>
            <p className="text-sm text-zinc-600">
              Votre home staging virtuel en 15 secondes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
