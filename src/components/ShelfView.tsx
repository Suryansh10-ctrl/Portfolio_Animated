"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Book, ProjectItem, ExperienceItem, EducationItem, AchievementItem, SkillItem, AboutItem } from "@/types/portfolio";
import { portfolio } from "@/lib/portfolio";

// ── WebGL detection ───────────────────────────────────────────────────────────
function detectWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

// ── Accessible text: one section per book ─────────────────────────────────────
function TextSection({ book }: { book: Book }) {
  return (
    <section aria-labelledby={`sec-${book.id}`}>
      <p className="eyebrow">Volume {book.roman} · {book.discipline}</p>
      <h2 id={`sec-${book.id}`}>{book.title}</h2>
      <p>{book.deck}</p>
      {book.specs.length > 0 && (
        <dl>
          {book.specs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {book.items.length > 0 && <ItemList book={book} />}
      <div>
        <Link href={`/${book.id}`} className="route-link-button">
          Open dedicated Volume {book.roman} page &rarr;
        </Link>
      </div>
    </section>
  );
}

function ItemList({ book }: { book: Book }) {
  const p = portfolio;
  if (book.id === "about" && book.items.length > 0) {
    return (
      <ul className="item-list">
        {(book.items as AboutItem[]).map((item) => (
          <li key={item.label}>
            <p className="item-title">{item.label}</p>
            <p>{item.value}</p>
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "projects") {
    return (
      <ul className="item-list">
        {(book.items as ProjectItem[]).map((item) => (
          <li key={item.title}>
            <p className="item-title">{item.title}</p>
            <p className="item-meta">{item.role} · {item.stack} · {item.year} · {item.status}</p>
            <p>{item.summary}</p>
            <ul className="item-links">
              {item.url && <li><a href={item.url} target="_blank" rel="noopener noreferrer">Live site</a></li>}
              {item.source && <li><a href={item.source} target="_blank" rel="noopener noreferrer">Source</a></li>}
            </ul>
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "experience") {
    return (
      <ul className="item-list">
        {(book.items as ExperienceItem[]).map((item) => (
          <li key={item.org + item.title}>
            <p className="item-title">{item.title}</p>
            <p className="item-meta">{item.org} · {item.start}–{item.end}</p>
            <ul className="bullet-list">
              {item.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "education") {
    return (
      <ul className="item-list">
        {(book.items as EducationItem[]).map((item) => (
          <li key={item.institution}>
            <p className="item-title">{item.programme}</p>
            <p className="item-meta">{item.institution} · {item.start}–{item.end}</p>
            {item.coursework.length > 0 && (
              <ul className="bullet-list">
                {item.coursework.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "achievements") {
    return (
      <ul className="item-list">
        {(book.items as AchievementItem[]).map((item) => (
          <li key={item.title}>
            <p className="item-title">{item.title}</p>
            <p className="item-meta">{item.issuer} · {item.date}</p>
            {item.url && <ul className="item-links"><li><a href={item.url} target="_blank" rel="noopener noreferrer">Verify</a></li></ul>}
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "skills") {
    return (
      <ul className="item-list">
        {(book.items as SkillItem[]).map((item) => (
          <li key={item.area}>
            <p className="item-title">{item.area}</p>
            <p>{item.skills.join(", ")}</p>
          </li>
        ))}
      </ul>
    );
  }
  if (book.id === "contact") {
    return (
      <ul className="contact-links">
        <li><a href={`mailto:${p.person.contact.email}`}>{p.person.contact.email}</a></li>
        {p.person.contact.links.filter((l) => l.url).map((l) => (
          <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>
        ))}
        <li><a href={p.person.resumeDocx || p.person.resume} download="SURYANSH-SHARMA-RESUME(fullstack).docx">Download resume (DOCX)</a></li>
        <li><a href={p.person.resumePdf || "/resume.pdf"} download="SURYANSH-SHARMA-RESUME(fullstack).pdf">Download resume (PDF)</a></li>
      </ul>
    );
  }
  return null;
}

// ── No-WebGL notice ───────────────────────────────────────────────────────────
function NoWebGLNotice({ onShowText }: { onShowText: () => void }) {
  return (
    <div className="no-webgl-notice" role="alert">
      <h2>3D shelf not available</h2>
      <p>WebGL is not supported or disabled in this browser.</p>
      <p>All portfolio content is available below.</p>
      <button type="button" onClick={onShowText}>View portfolio as text</button>
    </div>
  );
}

// ── Main Shelf Component ──────────────────────────────────────────────────────
export default function ShelfView() {
  const [mounted, setMounted] = useState(false);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [textVisible, setTextVisible] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const p = portfolio;

  useEffect(() => {
    setMounted(true);
    const hasWebGL = detectWebGL();
    setWebGLAvailable(hasWebGL);
    if (!hasWebGL) {
      setTextVisible(true);
    }
  }, []);

  const toggleText = () => setTextVisible((v) => !v);

  // Return focus to iframe when text view is closed
  useEffect(() => {
    if (!textVisible && iframeRef.current) {
      iframeRef.current.focus();
    }
  }, [textVisible]);

  const IFRAME_SRC = "/landing-pages/shelf-portfolio-v3.html";

  return (
    <div className="shelf-container">
      <div className="portfolio-root">
        {/* 3D shelf iframe — only rendered when WebGL is available */}
        {mounted && webGLAvailable && (
          <iframe
            ref={iframeRef}
            className="shelf-frame"
            src={IFRAME_SRC}
            title={`${p.collectionTitle} — Interactive portfolio shelf`}
            tabIndex={textVisible ? -1 : 0}
            aria-hidden={textVisible}
          />
        )}

        {/* No-WebGL fallback */}
        {mounted && !webGLAvailable && (
          <NoWebGLNotice onShowText={() => setTextVisible(true)} />
        )}

        {/* Accessible text version */}
        <div
          className={`sr-content${textVisible ? " visible" : ""}`}
          id="text-portfolio"
          aria-label="Portfolio text version"
          role="region"
        >
          <div className="text-view">
            <header>
              <h1>{p.person.name}</h1>
              <p className="role">{p.person.role} · {p.person.location}</p>
              <p className="bio">{p.person.bio}</p>
              <p className="bio"><strong>Currently:</strong> {p.person.currently}</p>
              <ul className="contact-links">
                <li><a href={`mailto:${p.person.contact.email}`}>{p.person.contact.email}</a></li>
                {p.person.contact.links.filter((l) => l.url).map((l) => (
                  <li key={l.label}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  </li>
                ))}
                <li><a href={p.person.resumeDocx || p.person.resume} download="SURYANSH-SHARMA-RESUME(fullstack).docx">Download resume (DOCX)</a></li>
                <li><a href={p.person.resumePdf || "/resume.pdf"} download="SURYANSH-SHARMA-RESUME(fullstack).pdf">Download resume (PDF)</a></li>
              </ul>
            </header>
            {p.books.map((book) => (
              <TextSection key={book.id} book={book} />
            ))}
            <footer style={{ marginTop: "3rem", borderTop: "1px solid rgba(244,238,230,0.1)", paddingTop: "1.5rem", color: "#b9b4ae", fontSize: "0.8125rem" }}>
              <p>Portfolio of {p.person.name} · {new Date().getFullYear()}</p>
              {webGLAvailable && (
                <button
                  type="button"
                  onClick={toggleText}
                  style={{ marginTop: "0.75rem", background: "none", border: "1px solid rgba(244,238,230,0.2)", borderRadius: "4px", color: "#b9b4ae", padding: "6px 12px", fontSize: "0.8125rem", cursor: "pointer" }}
                >
                  Return to 3D shelf
                </button>
              )}
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
}
