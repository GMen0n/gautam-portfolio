import { motion, useReducedMotion } from "framer-motion";
import { profile } from "../data/links";

const presets = [
  {
    n: "1",
    label: "GitHub",
    detail: `@${profile.githubHandle}`,
    href: profile.github,
    external: true,
  },
  {
    n: "2",
    label: "LinkedIn",
    detail: profile.linkedinHandle,
    href: profile.linkedin,
    external: true,
  },
  {
    n: "3",
    label: "Email",
    detail: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
  },
  {
    n: "4",
    label: "Resume",
    detail: "Have a look at my resume",
    href: profile.resume,
    external: true,
  },
];

export default function Contact() {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Contact</h2>
          <span className="rule" />
        </div>
        <h3 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Let&apos;s <span className="text-lcd-amber">connect.</span>
        </h3>
        <p className="mt-5 max-w-[560px] text-base leading-relaxed text-text-secondary">
          I&apos;m currently open to Summer 2027 internship opportunities in SDE and AI Engineering
          roles.
        </p>
        <div className="dash-module mt-12 p-2 sm:p-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {presets.map((preset, i) => (
              <motion.a
                key={preset.n}
                href={preset.href}
                target={preset.external ? "_blank" : undefined}
                rel={preset.external ? "noopener noreferrer" : undefined}
                className={`telltale telltale-amber preset-key${preset.label === "Email" ? " preset-key-email" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
              >
                <span className="font-dash text-[1.35rem] font-bold leading-none tracking-[0.06em] text-lcd-amber">
                  {preset.n}
                </span>
                <span>
                  <span className="block">{preset.label}</span>
                  <span className="mt-1 block font-sans text-xs font-normal normal-case tracking-normal text-text-secondary [text-shadow:none]">
                    {preset.detail}
                  </span>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
