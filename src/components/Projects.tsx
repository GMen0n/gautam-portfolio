import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";

const badgeAccents = [
  "border-l-accent-blue",
  "border-l-accent-violet",
  "border-l-accent-teal",
  "border-l-accent-pink",
];

export default function Projects() {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="scroll-mt-24">
      <div className="section-shell">
        <div className="mb-10 flex items-center gap-3">
          <span className="font-mono text-sm font-medium tracking-wide text-text-muted">[02]</span>
          <span className="font-mono text-sm text-text-muted">/</span>
          <h2 className="font-display text-sm font-medium uppercase tracking-[0.14em] text-text-primary">
            Work
          </h2>
          <span className="h-px flex-1 bg-bg-surface" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              className="glow-card rounded-2xl border border-bg-surface p-6 transition-transform duration-300 hover:-translate-y-1"
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <h3 className="font-display text-2xl font-semibold text-text-primary">
                {project.title}
              </h3>
              <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-text-secondary">
                {project.description}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech, ti) => (
                  <li
                    key={tech}
                    className={`rounded-full border-l-2 bg-bg-surface px-2.5 py-1 font-mono text-xs text-text-secondary ${badgeAccents[ti % badgeAccents.length]}`}
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm text-accent-teal"
              >
                GitHub
                <ArrowUpRight size={14} strokeWidth={1.5} />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
