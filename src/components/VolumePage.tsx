import Link from "next/link";
import type {
  Book,
  ProjectItem,
  SkillItem,
  ExperienceItem,
  EducationItem,
  AchievementItem,
} from "@/types/portfolio";
import { portfolio, getAdjacentBooks, getAllBooks } from "@/lib/portfolio";

interface VolumePageProps {
  book: Book;
}

function renderSpecValue(label: string, value: string, resumeUrl: string) {
  if (!value) return "";
  const str = value.trim();
  if (/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(str) || /^mailto:/i.test(str)) {
    const email = str.replace(/^mailto:/i, "");
    return (
      <a href={`mailto:${email}`} className="spec-link" title={`Send email to ${email}`}>
        {email}
      </a>
    );
  }
  if (/linkedin/i.test(label) || /linkedin\.com/i.test(str)) {
    const url = str.startsWith("http")
      ? str
      : `https://${str.includes("linkedin.com") ? str : `www.linkedin.com/in/${str}`}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="spec-link"
        title="Open LinkedIn Profile"
      >
        {str} &nearr;
      </a>
    );
  }
  if (/github/i.test(label) || /repos/i.test(label) || /^github\.com/i.test(str)) {
    const url = str.startsWith("http") ? str : `https://${str}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="spec-link"
        title={`Open ${url}`}
      >
        {str} &nearr;
      </a>
    );
  }
  if (/resume|pdf|docx/i.test(label) || /download/i.test(str)) {
    const isPdf = str.toLowerCase().includes("pdf");
    const file = isPdf ? "/resume.pdf" : (resumeUrl || "/resume.docx");
    const filename = isPdf ? "SURYANSH-SHARMA-RESUME(fullstack).pdf" : "SURYANSH-SHARMA-RESUME(fullstack).docx";
    return (
      <a
        href={file}
        download={filename}
        className="spec-link"
        title={`Download Resume (${isPdf ? "PDF" : "DOCX"})`}
      >
        {str} &darr;
      </a>
    );
  }
  return str;
}

export default function VolumePage({ book }: VolumePageProps) {
  const { prev, next } = getAdjacentBooks(book.id);
  const allBooks = getAllBooks();
  const person = portfolio.person;

  return (
    <div className="volume-page-wrapper">
      {/* Top Sticky Navigation Bar */}
      <header className="volume-top-nav">
        <div className="volume-top-nav-inner">
          <Link href="/" className="back-to-shelf-link" title="Return to 3D Bookshelf">
            <span aria-hidden="true">&larr;</span> 3D Shelf
          </Link>

          <span className="nav-volume-indicator">
            {book.volumeLabel} &middot; {book.title}
          </span>

          <nav className="nav-volume-links" aria-label="All volumes">
            {allBooks.map((b) => (
              <Link
                key={b.id}
                href={`/${b.id}`}
                className={`nav-vol-pill${b.id === book.id ? " active" : ""}`}
                title={`Volume ${b.roman}: ${b.title}`}
              >
                Vol {b.roman}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Volume Container */}
      <main className="volume-main">
        {/* Volume Hero Section */}
        <section className="volume-hero">
          <div
            className="volume-accent-bar"
            style={{ backgroundColor: book.foil || book.color }}
          />
          <p className="volume-meta-tag">
            {book.volumeLabel} &middot; {book.discipline}
          </p>
          <h1 className="volume-title">{book.title}</h1>
          <p className="volume-note">{book.note}</p>
          <p className="volume-deck">{book.deck}</p>

          {book.chapters && book.chapters.length > 0 && (
            <div className="chapters-row">
              <span className="chapter-label">Chapters:</span>
              {book.chapters.map((ch, idx) => (
                <span key={idx} className="chapter-chip">
                  {ch}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Volume Body: Two-Column Responsive Layout */}
        <div className="volume-layout">
          {/* Specifications Sidebar */}
          <aside className="specs-panel" aria-label="Volume Specifications">
            <h2 className="specs-title">Specifications</h2>
            <dl className="specs-list">
              {book.specs.map((s) => (
                <div key={s.label} className="spec-item">
                  <dt>{s.label}</dt>
                  <dd>{renderSpecValue(s.label, s.value, person.resume)}</dd>
                </div>
              ))}
              <div className="spec-item">
                <dt>Volume Binding</dt>
                <dd>{book.paletteLabel}</dd>
              </div>
            </dl>
          </aside>

          {/* Main Content Area */}
          <div className="volume-content-main">
            {/* Volume I: About */}
            {book.id === "about" && (
              <section aria-labelledby="about-details">
                <h2 id="about-details" style={{ display: "none" }}>About Suryansh Sharma</h2>
                <div className="timeline-card">
                  <div className="timeline-header">
                    <h3 className="timeline-title">{person.name}</h3>
                    <p className="timeline-org">{person.role} &middot; {person.location}</p>
                  </div>
                  <p style={{ color: "#d4cec8", lineHeight: 1.7, marginBottom: "1rem" }}>
                    {person.bio}
                  </p>
                  <p style={{ color: "#d4cec8", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                    <strong style={{ color: "#f4eee6" }}>Currently:</strong> {person.currently}
                  </p>
                  <ul className="project-links">
                    <li>
                      <a href={`mailto:${person.contact.email}`} className="action-link">
                        Email Developer
                      </a>
                    </li>
                    {person.contact.links.filter((l) => l.url).map((l) => (
                      <li key={l.label}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="action-link">
                          {l.label} &rarr;
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href={person.resumeDocx || person.resume}
                        download="SURYANSH-SHARMA-RESUME(fullstack).docx"
                        className="action-link"
                      >
                        Download Resume (DOCX)
                      </a>
                    </li>
                    <li>
                      <a
                        href={person.resumePdf || "/resume.pdf"}
                        download="SURYANSH-SHARMA-RESUME(fullstack).pdf"
                        className="action-link"
                      >
                        Download Resume (PDF)
                      </a>
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* Volume II: Projects */}
            {book.id === "projects" && (
              <section aria-label="Selected Projects">
                {(book.items as ProjectItem[]).map((project) => (
                  <article key={project.title} className="project-card">
                    <div className="project-card-header">
                      <h2 className="project-card-title">{project.title}</h2>
                      {project.status && (
                        <span className="status-badge">{project.status}</span>
                      )}
                    </div>
                    <p className="project-meta-line">
                      <span>{project.role}</span> &middot; <span>{project.year}</span> &middot;{" "}
                      <span style={{ color: "#e5ded6" }}>{project.stack}</span>
                    </p>
                    <p className="project-summary">{project.summary}</p>
                    {project.bullets && project.bullets.length > 0 && (
                      <ul className="bullet-list" style={{ margin: "0.6rem 0 0.85rem 0" }}>
                        {project.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    <ul className="project-links">
                      {project.url && (
                        <li>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-link"
                          >
                            Live Site &rarr;
                          </a>
                        </li>
                      )}
                      {project.source && (
                        <li>
                          <a
                            href={project.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-link"
                          >
                            Source Code &rarr;
                          </a>
                        </li>
                      )}
                      {!project.url && !project.source && (
                        <li>
                          <span style={{ fontSize: "0.75rem", color: "#8c8780", fontStyle: "italic" }}>
                            Source / Deployment link updating soon
                          </span>
                        </li>
                      )}
                    </ul>
                  </article>
                ))}
              </section>
            )}

            {/* Volume III: Skills */}
            {book.id === "skills" && (
              <section aria-label="Technical Skills" className="skills-grid">
                {(book.items as SkillItem[]).map((cat) => (
                  <div key={cat.area} className="skill-category-card">
                    <h2 className="skill-category-title">{cat.area}</h2>
                    <div className="skill-tags">
                      {cat.skills.map((skill) => (
                        <span key={skill} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Volume IV: Experience */}
            {book.id === "experience" && (
              <section aria-label="Experience & Practice">
                {(book.items as ExperienceItem[]).map((exp) => (
                  <article key={exp.org + exp.title} className="timeline-card">
                    <div className="timeline-header">
                      <h2 className="timeline-title">{exp.title}</h2>
                      <p className="timeline-org">
                        {exp.org} &middot; {exp.start}&ndash;{exp.end}
                      </p>
                    </div>
                    <ul className="timeline-bullets">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            )}

            {/* Volume V: Education */}
            {book.id === "education" && (
              <section aria-label="Education & Coursework">
                {(book.items as EducationItem[]).map((edu) => (
                  <article key={edu.institution} className="timeline-card">
                    <div className="timeline-header">
                      <h2 className="timeline-title">{edu.programme}</h2>
                      <p className="timeline-org">
                        {edu.institution} &middot; {edu.start}&ndash;{edu.end}
                      </p>
                    </div>
                    {edu.coursework && edu.coursework.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.8125rem", color: "#b9b4ae", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Core Coursework:
                        </p>
                        <div className="skill-tags">
                          {edu.coursework.map((course, idx) => (
                            <span key={idx} className="skill-pill">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </section>
            )}

            {/* Volume VI: Achievements */}
            {book.id === "achievements" && (
              <section aria-label="Achievements & Recognition">
                {book.items && book.items.length > 0 ? (
                  (book.items as AchievementItem[]).map((item) => (
                    <article key={item.title} className="timeline-card">
                      <div className="timeline-header">
                        <h2 className="timeline-title">{item.title}</h2>
                        <p className="timeline-org">{item.issuer} &middot; {item.date}</p>
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="action-link">
                          Verify Credential &rarr;
                        </a>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="timeline-card">
                    <h2 className="timeline-title">Engineering Milestones</h2>
                    <p style={{ color: "#d4cec8", lineHeight: 1.6, marginTop: "0.75rem", marginBottom: "1.25rem" }}>
                      Active focus on open-source contributions, shipping real-world developer tools, and expanding into competitive problem solving and hackathons.
                    </p>
                    <ul className="project-links">
                      <li>
                        <a
                          href="https://github.com/Suryansh10-ctrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-link"
                        >
                          View GitHub Profile &rarr;
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Volume VII: Contact */}
            {book.id === "contact" && (
              <section aria-label="Contact Channels">
                <div className="contact-grid">
                  <a
                    href={`mailto:${person.contact.email}`}
                    className="contact-card contact-card-clickable"
                    title={`Send email to ${person.contact.email}`}
                  >
                    <div>
                      <p className="contact-card-label">Direct Email</p>
                      <p className="contact-card-value">{person.contact.email}</p>
                    </div>
                    <span className="action-link" style={{ alignSelf: "flex-start" }}>
                      Send Message &rarr;
                    </span>
                  </a>

                  {person.contact.links.map((link) => (
                    link.url ? (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-card contact-card-clickable"
                        title={`Open ${link.label}: ${link.url}`}
                      >
                        <div>
                          <p className="contact-card-label">{link.label}</p>
                          <p className="contact-card-value">{link.url}</p>
                        </div>
                        <span className="action-link" style={{ alignSelf: "flex-start" }}>
                          Visit {link.label} &rarr;
                        </span>
                      </a>
                    ) : (
                      <div key={link.label} className="contact-card">
                        <div>
                          <p className="contact-card-label">{link.label}</p>
                          <p className="contact-card-value">Available upon request</p>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#8c8780" }}>
                          Profile link pending
                        </span>
                      </div>
                    )
                  ))}

                  {person.contact.phone && (
                    <a
                      href={`tel:${person.contact.phone.replace(/[\s-]/g, "")}`}
                      className="contact-card contact-card-clickable"
                      title={`Call ${person.contact.phone}`}
                    >
                      <div>
                        <p className="contact-card-label">Phone</p>
                        <p className="contact-card-value">{person.contact.phone}</p>
                      </div>
                      <span className="action-link" style={{ alignSelf: "flex-start" }}>
                        Call &rarr;
                      </span>
                    </a>
                  )}

                  <a
                    href={person.resumeDocx || person.resume}
                    download="SURYANSH-SHARMA-RESUME(fullstack).docx"
                    className="contact-card contact-card-clickable"
                    title="Download Resume (DOCX / Word)"
                  >
                    <div>
                      <p className="contact-card-label">Curriculum Vitae</p>
                      <p className="contact-card-value">DOCX Resume (Word)</p>
                    </div>
                    <span className="action-link" style={{ alignSelf: "flex-start" }}>
                      Download DOCX &darr;
                    </span>
                  </a>

                  <a
                    href={person.resumePdf || "/resume.pdf"}
                    download="SURYANSH-SHARMA-RESUME(fullstack).pdf"
                    className="contact-card contact-card-clickable"
                    title="Download Curriculum Vitae (PDF)"
                  >
                    <div>
                      <p className="contact-card-label">Curriculum Vitae</p>
                      <p className="contact-card-value">PDF Resume</p>
                    </div>
                    <span className="action-link" style={{ alignSelf: "flex-start" }}>
                      Download PDF &darr;
                    </span>
                  </a>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Bottom Pagination */}
        <nav className="volume-pagination" aria-label="Volume Pagination">
          {prev ? (
            <Link href={`/${prev.id}`} className="pagination-btn">
              <span className="pagination-label">&larr; Previous Volume {prev.roman}</span>
              <span className="pagination-title">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link href="/" className="shelf-center-btn" title="Return to 3D Bookshelf">
            Return to 3D Shelf
          </Link>

          {next ? (
            <Link href={`/${next.id}`} className="pagination-btn next">
              <span className="pagination-label">Next Volume {next.roman} &rarr;</span>
              <span className="pagination-title">{next.title}</span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </main>
    </div>
  );
}
