import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { certifications, designLeadership, skillGroups } from "../data/skills";

export default function Skills() {
  const reduce = useReducedMotion();

  return (
    <section id="skills" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Skills</h2>
          <span className="rule" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {skillGroups.map((group, i) => (
            <motion.article
              key={group.title}
              className="glow-card rounded-2xl p-6"
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <h3
                className={`font-display text-base font-medium uppercase tracking-[0.08em] ${group.accent}`}
              >
                {group.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                {group.items.join(" · ")}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="glow-card mt-10 rounded-2xl p-6"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3 className="font-display text-base font-medium uppercase tracking-[0.08em] text-accent-amber">
            Certifications
          </h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert} className="text-[15px] text-text-secondary">
                {cert}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h3 className="font-display text-base font-medium uppercase tracking-[0.08em] text-text-primary">
            Design Work
          </h3>
          <ul className="mt-4 space-y-2 text-[15px] text-text-secondary">
            {designLeadership.map((item) => (
              <li key={item.title}>
                <span className="text-text-primary">{item.title}</span>
                <span className="text-text-muted"> — {item.context}</span>
              </li>
            ))}
          </ul>
          <a
            href="/design"
            className="link-slide mt-5 inline-flex items-center gap-2 text-sm text-accent"
          >
            View Design Work
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
