import { motion, useReducedMotion } from "framer-motion";
import { projects } from "../data/projects";

export default function Projects() {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="scroll-mt-24">
      <div className="section-shell">
        <div className="section-heading">
          <h2>Work</h2>
          <span className="rule" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              className="dash-module p-6"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
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
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="border-l-2 border-lcd-amber bg-lcd-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-text-secondary"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="telltale telltale-amber mt-6"
              >
                GitHub
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
