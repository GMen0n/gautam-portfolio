import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "../data/links";

export default function Hero() {
  const reduce = useReducedMotion();

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, ease: "easeOut" as const, delay },
      };

  return (
    <section
      id="home"
      className="hero-stage relative flex min-h-screen items-center overflow-hidden pt-20"
    >
      <div className="hero-bezel" aria-hidden />

      <div className="section-shell relative flex flex-col items-center text-center">
        <motion.div className="hero-display" {...fade(0)}>
          <div className="hero-display-glass" aria-hidden />
          <span className="hero-handle-pill mb-5 inline-flex items-center self-start rounded-full px-3 py-[3px] font-segment text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs">
            {profile.handle}
          </span>
          <h1 className="hero-name font-segment text-[32px] font-bold uppercase leading-[1.12] tracking-[0.12em] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.75rem]">
            Gautam Menon
          </h1>
          <div
            className="hero-ticker mt-8"
            aria-label={profile.taglineLines.map((l) => `${l.prefix}${l.accent}${l.rest}`).join(" ")}
          >
            <div className="hero-ticker-track">
              {[0, 1].map((copy) => (
                <p key={copy} className="hero-ticker-copy">
                  {profile.taglineLines.map((line, i) => (
                    <span key={line.accent + line.rest}>
                      {i > 0 && <span className="hero-ticker-sep"> · </span>}
                      {`${line.prefix}${line.accent}${line.rest}`}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          {...fade(0.35)}
        >
          <a href="/#contact" className="telltale telltale-red">
            Get in Touch
          </a>
          <a href="/#work" className="telltale telltale-amber gap-2">
            See My Work
            <ArrowDown size={16} strokeWidth={2.25} />
          </a>
        </motion.div>
        <motion.p className="hero-display-meta mt-12 text-sm" {...fade(0.5)}>
          {profile.location}
          <span className="mx-2">·</span>
          {profile.study}
          <span className="mx-2">·</span>
          {profile.years}
        </motion.p>
      </div>
    </section>
  );
}
