import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "../data/links";

const accents = ["text-accent-blue", "text-accent-violet", "text-accent-pink"] as const;

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
    <section className="relative flex min-h-screen items-center pt-20">
      <div className="section-shell">
        <motion.p
          className="mb-6 font-mono text-sm text-text-muted"
          {...fade(0)}
        >
          {profile.handle}
        </motion.p>
        <motion.h1
          className="font-display text-[36px] font-bold uppercase leading-[1.05] tracking-[0.12em] text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          {...fade(0)}
        >
          Gautam Menon
        </motion.h1>
        <div className="mt-8 max-w-2xl space-y-2 text-lg leading-relaxed text-text-secondary md:text-xl">
          {profile.taglineLines.map((line, i) => (
            <motion.p key={line.accent + line.rest} {...fade(0.15 * (i + 1))}>
              {line.prefix}
              <span className={accents[i]}>{line.accent}</span>
              {line.rest}
            </motion.p>
          ))}
        </div>
        <motion.div className="mt-10 flex flex-wrap gap-3" {...fade(0.5)}>
          <a
            href="/#contact"
            className="rounded-full bg-accent-blue px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get in Touch
          </a>
          <a
            href="/#work"
            className="inline-flex items-center gap-2 rounded-full border border-bg-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-text-muted"
          >
            See My Work
            <ArrowDown size={16} strokeWidth={1.5} />
          </a>
        </motion.div>
        <motion.p
          className="mt-12 text-sm text-text-muted"
          {...fade(0.6)}
        >
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
