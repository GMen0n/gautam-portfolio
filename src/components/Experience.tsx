import { motion, useReducedMotion } from "framer-motion";
import { experience } from "../data/experience";

export default function Experience() {
  const reduce = useReducedMotion();

  return (
    <section id="experience" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Experience</h2>
          <span className="rule" />
        </div>
        <ol className="relative ml-3 border-l border-transparent md:ml-4">
          <span
            className="absolute top-1 bottom-1 left-[-1px] w-px"
            style={{ background: "linear-gradient(180deg, #FF6D29, #E8A84A)" }}
            aria-hidden
          />
          {experience.map((job, i) => (
            <motion.li
              key={job.role}
              className="relative mb-12 pl-8 last:mb-0"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <span className="absolute top-1.5 left-[-5px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-bg-base" />
              <h3 className="font-display text-xl font-semibold text-text-primary">{job.role}</h3>
              <p className="mt-1 text-base font-medium text-accent-amber">{job.company}</p>
              <p className="mt-1 font-mono text-[13px] text-text-muted">{job.dates}</p>
              <ul className="mt-4 max-w-[720px] space-y-2 text-[15px] leading-relaxed text-text-secondary">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
