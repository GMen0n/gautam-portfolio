import { motion, useReducedMotion } from "framer-motion";
import { FileText, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./icons";
import { profile } from "../data/links";

const cards = [
  {
    n: "01",
    label: "GitHub",
    detail: `@${profile.githubHandle}`,
    href: profile.github,
    external: true,
    icon: GithubIcon,
  },
  {
    n: "02",
    label: "LinkedIn",
    detail: profile.linkedinHandle,
    href: profile.linkedin,
    external: true,
    icon: LinkedinIcon,
  },
  {
    n: "03",
    label: "Email",
    detail: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
    icon: Mail,
  },
  {
    n: "04",
    label: "Resume",
    detail: "Have a look at my resume",
    href: profile.resume,
    external: true,
    icon: FileText,
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
          Let&apos;s <span className="text-accent">connect.</span>
        </h3>
        <p className="mt-5 max-w-[560px] text-base leading-relaxed text-text-secondary">
          I&apos;m currently open to Summer 2027 internship opportunities in SDE and AI Engineering
          roles.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.a
                key={card.n}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="glow-card group rounded-2xl p-6"
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
              >
                <Icon size={20} strokeWidth={1.5} className="text-text-primary" />
                <p className="mt-5 font-display text-lg font-semibold text-text-primary">
                  {card.label}
                </p>
                <p className="mt-1 break-all text-sm text-text-secondary">{card.detail}</p>
                <p className="mt-6 font-mono text-xs text-text-muted">— {card.n}</p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
