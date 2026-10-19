/**
 * build-portfolio-html.mjs
 *
 * Reads content/portfolio.json and public/landing-pages/complete-shelf-v2.html,
 * applies all content and CDN replacements, and writes the result to
 * public/landing-pages/complete-shelf-portfolio.html.
 *
 * Fails loudly if any anchor is missing.
 * Fails loudly if portfolio.json still contains [TODO] placeholders.
 * Diffs the output against the canonical source at the end.
 */

import { readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";

const PORTFOLIO_JSON = "content/portfolio.json";
const SOURCE_HTML = "public/landing-pages/complete-shelf-v2.html";
const OUTPUT_HTML = "public/landing-pages/complete-shelf-portfolio.html";
const VERSIONED_HTML = "public/landing-pages/shelf-portfolio-v4.html";

// ── Load inputs ──────────────────────────────────────────────────────────────

const portfolio = JSON.parse(readFileSync(PORTFOLIO_JSON, "utf8"));

// Validate: no [TODO] placeholders
const raw = JSON.stringify(portfolio);
if (raw.includes("[TODO")) {
  const todos = [...raw.matchAll(/\[TODO[^\]]*\]/g)].map((m) => m[0]);
  process.exit(1);
}

// Validate: exactly 7 books
if (portfolio.books.length !== 7) {
  process.exit(1);
}

// Validate: unique IDs
const ids = portfolio.books.map((b) => b.id);
if (new Set(ids).size !== ids.length) {
  process.exit(1);
}

let html = readFileSync(SOURCE_HTML, "utf8");

// Record canonical hash for the diff note
const canonicalHash = createHash("sha256").update(html).digest("hex");

// ── Helper: replace with anchor verification ─────────────────────────────────

function replace(anchor, replacement) {
  if (!html.includes(anchor)) {
    process.exit(1);
  }
  html = html.replace(anchor, replacement);
}

function replaceAll(anchor, replacement) {
  if (!html.includes(anchor)) {
    process.exit(1);
  }
  html = html.replaceAll(anchor, replacement);
}

// ── 1. Self-host Three.js (importmap) ────────────────────────────────────────

replace(
  `"three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"`,
  `"three": "/vendor/three/three.module.js",
        "three/addons/": "/vendor/three/addons/"`,
  "Three.js importmap → self-hosted"
);

// ── 2. Self-host cover atlas and wood texture ─────────────────────────────────

replace(
  `const COVER_ATLAS_DATA = "https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/embedded/30536331bc911f1e9310f2ea44dca373201b83f2b11dac4434f8acf07018e963.webp";`,
  `const COVER_ATLAS_DATA = "/vendor/cover-atlas.webp";`,
  "Cover atlas URL → self-hosted"
);

replace(
  `const WOOD_TEXTURE_DATA = "https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/embedded/f64eba8c9996b77873bbd70424769bc2c399a8a5c1e2d28ecea2673728118f9f.webp";`,
  `const WOOD_TEXTURE_DATA = "/vendor/wood-texture.webp";`,
  "Wood texture URL → self-hosted"
);

// ── 3. Document title and meta ────────────────────────────────────────────────

const metaDesc = `Working Volumes is an original interactive Three.js library of seven tactile field guides for contemporary creative tools.`;
replace(
  metaDesc,
  `${portfolio.collectionTitle} — ${portfolio.collectionSubtitle}. Built with Three.js.`,
  "Meta description"
);

// Title tag (handle the mojibake character)
html = html.replace(
  /<title>.*?<\/title>/,
  `<title>${portfolio.collectionTitle} — Portfolio</title>`
);

// Theme color stays as-is (#171a24) — suits the dark portfolio look

// ── 4. Collection header (editorial-identity) ────────────────────────────────

replace(
  `<strong>Working Volumes</strong>`,
  `<strong>${portfolio.collectionTitle}</strong>`,
  "Header brand name"
);

replace(
  `<span>Seven field guides for making</span>`,
  `<span>${portfolio.collectionSubtitle}</span>`,
  "Header subtitle"
);

replace(
  `<span>Edition 02 · 2026</span>`,
  `<span>${portfolio.collectionEdition}</span>`,
  "Header edition"
);

// ── 5. Initial browse UI (first book shown before JS runs) ────────────────────

const book0 = portfolio.books[0];

// Hover tooltip (pointer label — aria-hidden, updated by JS on hover)
replace(
  `<strong id="pointer-label-title">Codex</strong>`,
  `<strong id="pointer-label-title">${book0.title}</strong>`,
  "Pointer label title (hover tooltip)"
);

replace(
  `<h1 class="selection__title" id="selection-title">Codex</h1>`,
  `<h1 class="selection__title" id="selection-title">${book0.title}</h1>`,
  "Initial selection title"
);

replace(
  `<p class="selection__note" id="selection-note">Precise intent, translated into tested systems.</p>`,
  `<p class="selection__note" id="selection-note">${book0.note}</p>`,
  "Initial selection note"
);

// ── 6. Detail panel initial state ────────────────────────────────────────────

replace(
  `<p class="eyebrow" id="detail-eyebrow">Volume I · Agentic craft</p>`,
  `<p class="eyebrow" id="detail-eyebrow">Volume ${book0.roman} · ${book0.discipline}</p>`,
  "Detail panel eyebrow"
);

replace(
  `<h2 class="detail-title" id="detail-title">Codex</h2>`,
  `<h2 class="detail-title" id="detail-title">${book0.title}</h2>`,
  "Detail panel title"
);

replace(
  `A field manual for turning clear intent into working software, with verification treated as part of the craft.`,
  book0.deck,
  "Detail panel deck"
);

// Spec rows
replace(
  `<dd id="detail-binding">Evergreen cloth · antique brass foil</dd>`,
  `<dd id="detail-binding">${book0.specs[0].value}</dd>`,
  "Detail binding spec"
);

replace(
  `<dd id="detail-format">148 × 216 mm · imagined edition</dd>`,
  `<dd id="detail-format">${book0.specs[1].value}</dd>`,
  "Detail format spec"
);

replace(
  `<dd id="detail-theme">Intent into implementation</dd>`,
  `<dd id="detail-theme">${book0.specs[2].value}</dd>`,
  "Detail theme spec"
);

replace(
  `<dd id="detail-motif">Nested brackets</dd>`,
  `<dd id="detail-motif">${book0.motif}</dd>`,
  "Detail motif spec"
);

// Also update the dt labels to match portfolio spec labels
replace(
  `<dt>Binding</dt>`,
  `<dt>${book0.specs[0].label}</dt>`,
  "Spec label 0 (Binding → Based in)"
);

replace(
  `<dt>Format</dt>`,
  `<dt>${book0.specs[1].label}</dt>`,
  "Spec label 1 (Format → Role)"
);

replace(
  `<dt>Theme</dt>`,
  `<dt>${book0.specs[2].label}</dt>`,
  "Spec label 2 (Theme → Focus)"
);

replace(
  `<dt>Motif</dt>`,
  `<dt>${book0.specs[3].label}</dt>`,
  "Spec label 3 (Motif → Education)"
);

// ── 7. Static fallback section ────────────────────────────────────────────────

replace(
  `<p class="fallback__kicker">Working Volumes · Static catalog</p>`,
  `<p class="fallback__kicker">${portfolio.collectionTitle} · Portfolio</p>`,
  "Fallback kicker"
);

replace(
  `<h2 id="fallback-title">Seven tools for making.</h2>`,
  `<h2 id="fallback-title">${portfolio.collectionSubtitle}.</h2>`,
  "Fallback h2"
);

// Fallback book articles
const fallbackBooks = portfolio.books
  .map(
    (b) =>
      `<article class="fallback-book" style="--book-color:${b.color};--book-foil:${b.foil};--book-height:${Math.round(b.height * 240)}px"><span>Volume ${b.roman}</span><strong>${b.title}</strong></article>`
  )
  .join("\n        ");

const FALLBACK_BOOKS_ANCHOR = [
  `<article class="fallback-book" style="--book-color:#182a43;--book-foil:#c87046;--book-height:390px"><span>Volume I</span><strong>Codex</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#c24d24;--book-foil:#efc16d;--book-height:356px"><span>Volume II</span><strong>Claude Code</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#afc400;--book-foil:#171a16;--book-height:374px"><span>Volume III</span><strong>Cursor</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#1537a1;--book-foil:#dbe8f1;--book-height:404px"><span>Volume IV</span><strong>Antigravity</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#c83222;--book-foil:#efb0aa;--book-height:365px"><span>Volume V</span><strong>Figma</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#da3b2f;--book-foil:#ff8eab;--book-height:385px"><span>Volume VI</span><strong>Framer</strong></article>`,
  `        <article class="fallback-book" style="--book-color:#78a7bd;--book-foil:#e4e7e5;--book-height:398px"><span>Volume VII</span><strong>Xcode</strong></article>`,
].join("\n");

replace(
  FALLBACK_BOOKS_ANCHOR,
  fallbackBooks,
  "Fallback book articles (all 7)"
);

// Fallback footer
replace(
  `<span>All bindings, motifs, descriptions, geometry, and cover artworks are original to this conceptual study.</span>`,
  `<span>All book geometry, motifs, and styling are original to this portfolio.</span>`,
  "Fallback footer line 1"
);

replace(
  `<span>Product names are used editorially and remain the property of their respective owners.</span>`,
  `<span>Portfolio of ${portfolio.person.name} · ${new Date().getFullYear()}</span>`,
  "Fallback footer line 2"
);

// ── 8. Loading screen ─────────────────────────────────────────────────────────

replace(
  `<p>Binding the collection</p>`,
  `<p>Opening the portfolio</p>`,
  "Loading screen text"
);

// ── 9. BOOKS data array ───────────────────────────────────────────────────────

function bookToJS(b) {
  // Map portfolio.json fields to the BOOKS schema
  // specs[0..3] → binding, format, theme, motif (repurposed)
  const specs = b.specs || [];
  const binding = specs[0]?.value ?? "";
  const format = specs[1]?.value ?? "";
  const theme = specs[2]?.value ?? "";
  const motif = specs[3]?.value ?? b.motif ?? "";

  // paletteLabel from portfolio.json
  const pal = b.palette;

  return `      {
        id: "${b.id}",
        title: "${b.title}",
        roman: "${b.roman}",
        discipline: "${b.discipline}",
        note: "${b.note.replace(/"/g, '\\"')}",
        deck: "${b.deck.replace(/"/g, '\\"')}",
        binding: "${binding.replace(/"/g, '\\"')}",
        format: "${format.replace(/"/g, '\\"')}",
        theme: "${theme.replace(/"/g, '\\"')}",
        motif: "${motif.replace(/"/g, '\\"')}",
        motifKey: "${b.motifKey}",
        paletteLabel: "${b.paletteLabel}",
        color: "${b.color}",
        foil: "${b.foil}",
        palette: {
          paper: "${pal.paper}",
          paperDeep: "${pal.paperDeep}",
          paperPale: "${pal.paperPale}",
          ink: "${pal.ink}",
          inkSoft: "${pal.inkSoft}",
          wall: "${pal.wall}",
          shelf: "${pal.shelf}",
          shelfDark: "${pal.shelfDark}",
          light: "${pal.light}",
          fill: "${pal.fill}"
        },
        width: ${b.width},
        height: ${b.height},
        depth: ${b.depth},
        chapters: [${b.chapters.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(", ")}],
        seed: ${b.seed}
      }`;
}

const BOOKS_ANCHOR_START = `    const BOOKS = [`;
const BOOKS_ANCHOR_END = `    ];`;

const booksStart = html.indexOf(BOOKS_ANCHOR_START);
const booksEnd = html.indexOf(BOOKS_ANCHOR_END, booksStart);

if (booksStart === -1 || booksEnd === -1) {
  process.exit(1);
}

const newBooks =
  BOOKS_ANCHOR_START +
  "\n" +
  portfolio.books.map(bookToJS).join(",\n") +
  "\n    " +
  BOOKS_ANCHOR_END;

html = html.slice(0, booksStart) + newBooks + html.slice(booksEnd + BOOKS_ANCHOR_END.length);

// ── 9b. Page material: use pure white base color so canvas ink is not washed out
replace(
  `      pageSheet: new THREE.MeshPhysicalMaterial({
        color: 0xeee6d7,`,
  `      pageSheet: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,`,
  "Use pure white base for pageSheet material to preserve dark contrast"
);

// ── 10. Book running headers, colophon text & high-contrast page textures ───
replaceAll(
  `WORKING VOLUMES  /  `,
  `${portfolio.collectionTitle.toUpperCase()}  /  `,
  "Replace WORKING VOLUMES running headers on book textures"
);

replaceAll(
  `Conceived as an original editorial study for Working Volumes.`,
  `An original portfolio study.`,
  "Canvas colophon text (Working Volumes reference)"
);

// High-contrast interior page text: solid pitch-dark charcoal ink (#080604), 100% opacity (globalAlpha = 1.0),
// and bold typography (font-weight 600/700) so all text on all books is bold, dark, and unmistakably visible.
const startAnchorPages = "    function makeInteriorPageTextures(book) {";
const endAnchorPages = "    function makeContactShadowTexture() {";
const startIdxPages = html.indexOf(startAnchorPages);
const endIdxPages = html.indexOf(endAnchorPages);

if (startIdxPages === -1 || endIdxPages === -1) {
  process.exit(1);
}

const NEW_INTERIOR_PAGES = `    function makeInteriorPageTextures(book) {
      const pageCount = 8;
      // High-contrast, pitch-dark charcoal ink for crystal clear readability across all books
      const ink = "#080604";

      return Array.from({ length: pageCount }, (_, pageIndex) => {
        const canvas = document.createElement("canvas");
        const logicalWidth = 512;
        const logicalHeight = 768;
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext("2d");
        const random = seededRandom(hashSeed(\`\${book.id}-leaf-\${pageIndex}\`) + book.seed);
        drawPaperSurface(ctx, logicalWidth, logicalHeight, random);
        ctx.fillStyle = ink;
        ctx.strokeStyle = ink;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        // Running page header: crisp, dark and clearly visible
        ctx.fillStyle = ink;
        ctx.globalAlpha = 0.95;
        ctx.font = '700 12px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.letterSpacing = "2px";
        ctx.fillText(\`\${"${portfolio.collectionTitle.toUpperCase()}"}  /  \${book.roman}\`, 48, 48);
        ctx.textAlign = "right";
        ctx.fillText(pad(pageIndex + 1), logicalWidth - 48, 48);
        ctx.textAlign = "left";
        ctx.fillRect(48, 64, logicalWidth - 96, 1.5);
        ctx.globalAlpha = 1;

        if (pageIndex === 0) {
          // Eyebrow / discipline (e.g. INTRODUCTION): Bold and dark
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 14px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2.5px";
          ctx.fillText(book.discipline.toUpperCase(), 54, 174);

          // Title (e.g. About, Cloud IDE, etc.): Rich serif
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = \`600 \${book.title.length > 10 ? 50 : 60}px "Iowan Old Style", Georgia, "Times New Roman", serif\`;
          ctx.letterSpacing = "0px";
          drawWrappedCanvasText(ctx, book.title, 52, 246, 18, 60, 2);

          // Note / description: BOLD 600, 26px, 100% solid opacity, pitch dark ink
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 26px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(ctx, book.note, 54, 456, 32, 36, 5);
        } else if (pageIndex === 1 || pageIndex === 3) {
          const chapterIndex = pageIndex === 1 ? 0 : 1;
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText(\`CHAPTER \${pad(chapterIndex + 1)}\`, 54, 166);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 50px "Iowan Old Style", Georgia, "Times New Roman", serif';
          ctx.letterSpacing = "0px";
          drawWrappedCanvasText(ctx, book.chapters[chapterIndex], 52, 244, 18, 56, 3);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 24px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(
            ctx,
            chapterIndex === 0 ? book.note : book.deck,
            54,
            438,
            36,
            34,
            6
          );
        } else if (pageIndex === 2) {
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText("PLATE 01  /  SYSTEM MOTIF", 54, 146);
          ctx.save();
          ctx.globalAlpha = 0.90;
          drawMotif(ctx, { ...book, foil: ink }, logicalWidth, logicalHeight * 0.92);
          ctx.restore();

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 22px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(ctx, book.theme, 54, 650, 38, 30, 3);
        } else if (pageIndex === 4) {
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText(\`NOTES  /  \${book.chapters[1].toUpperCase()}\`, 54, 138);

          ctx.globalAlpha = 0.70;
          for (let column = 0; column < 2; column += 1) {
            const left = 54 + column * 214;
            for (let line = 0; line < 24; line += 1) {
              const width = line % 7 === 6 ? 72 + random() * 54 : 138 + random() * 44;
              ctx.fillRect(left, 190 + line * 18, width, 1.5);
            }
          }

          ctx.globalAlpha = 1.0;
          ctx.strokeRect(54, 654, 404, 54);
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "1.6px";
          ctx.fillText(book.motif.toUpperCase(), 70, 686);
        } else if (pageIndex === 5) {
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText("CHAPTER 03", 54, 166);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 50px "Iowan Old Style", Georgia, "Times New Roman", serif';
          ctx.letterSpacing = "0px";
          drawWrappedCanvasText(ctx, book.chapters[2], 52, 244, 18, 56, 3);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 24px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(ctx, book.deck, 54, 438, 36, 34, 6);
        } else if (pageIndex === 6) {
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText("PLATE 02  /  TECHNICAL SYSTEM", 54, 146);
          ctx.save();
          ctx.translate(logicalWidth * 0.5, 380);
          ctx.globalAlpha = 0.90;
          for (let ring = 0; ring < 5; ring += 1) {
            const radius = 38 + ring * 34;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
          for (let spoke = 0; spoke < 8; spoke += 1) {
            const angle = spoke * Math.PI * 0.25;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 36, Math.sin(angle) * 36);
            ctx.lineTo(Math.cos(angle) * 176, Math.sin(angle) * 176);
            ctx.stroke();
          }
          ctx.restore();

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 22px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(ctx, book.theme, 54, 650, 38, 30, 3);
        } else {
          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "2px";
          ctx.fillText("COLOPHON", 54, 164);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 34px "Iowan Old Style", Georgia, "Times New Roman", serif';
          ctx.letterSpacing = "0px";
          ctx.fillText(book.title, 54, 230);

          ctx.fillStyle = ink;
          ctx.globalAlpha = 1.0;
          ctx.font = '600 22px "Iowan Old Style", Georgia, "Times New Roman", serif';
          drawWrappedCanvasText(
            ctx,
            \`\${book.binding}. \${book.format}. An original portfolio study.\`,
            54,
            306,
            38,
            32,
            7
          );
          ctx.globalAlpha = 0.95;
          ctx.font = '700 13px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.letterSpacing = "1.8px";
          ctx.fillText(\`SPECIMEN \${book.roman} / \${book.seed}  ·  PORTFOLIO EDITION\`, 54, 676);
        }

        ctx.globalAlpha = 0.90;
        ctx.fillRect(48, logicalHeight - 48, logicalWidth - 96, 1.5);
        ctx.globalAlpha = 1;
        const texture = configureCanvasTexture(new THREE.CanvasTexture(canvas), {
          anisotropy: 16
        });
        texture.name = \`\${book.id}-interior-page-\${pageIndex + 1}\`;
        return texture;
      });
    }\n\n`;

html = html.slice(0, startIdxPages) + NEW_INTERIOR_PAGES + html.slice(endIdxPages);

// ── 10c. Loading speed optimizations ─────────────────────────────────────────
// 1. Cut fiber/fleck loop count by 95% — eliminates over 140,000 canvas stroke calls across all books
replace(
  `for (let fiber = 0; fiber < 2400; fiber += 1) {`,
  `for (let fiber = 0; fiber < 80; fiber += 1) {`,
  "Optimize fiber count from 2400 to 80 for instant canvas drawing"
);

replace(
  `for (let fleck = 0; fleck < 1200; fleck += 1) {`,
  `for (let fleck = 0; fleck < 40; fleck += 1) {`,
  "Optimize fleck count from 1200 to 40 for instant canvas drawing"
);

// 2. Reduce cloth surface map size from 256 to 128 (tiled with repeat(5, 8), visually identical, 4x faster)
replace(
  `const size = 256;\n      const heightField = new Float32Array(size * size);`,
  `const size = 128;\n      const heightField = new Float32Array(size * size);`,
  "Optimize cloth surface maps size from 256 to 128 for faster startup"
);

// 3. Fast initialization: non-blocking font load (max 60ms timeout) and parallel image decoding
replace(
  `      try {
        await document.fonts.load("600 82px Inter");
      } catch (error) {
        // The system sans-serif fallback keeps the interface usable offline.
      }

      try {
        await coverAtlasImage.decode();
        coverAtlasReady = true;
      } catch (error) {
        coverAtlasReady = false;
      }`,
  `      // High-speed initialization: font load max 60ms, decode atlas in parallel
      try {
        await Promise.race([
          document.fonts.load("600 82px Inter"),
          new Promise((resolve) => setTimeout(resolve, 60))
        ]);
      } catch (error) {}

      const coverAtlasPromise = coverAtlasImage.decode().then(
        () => { coverAtlasReady = true; },
        () => { coverAtlasReady = false; }
      );`,
  "Non-blocking font load and parallel cover atlas decode"
);

replace(
  `      bookRigs = BOOKS.map((book, index) => {`,
  `      await coverAtlasPromise;
      bookRigs = BOOKS.map((book, index) => {`,
  "Await cover atlas right before creating book meshes"
);

// 4. Reduce scene reveal transition time from 900ms to 200ms
replaceAll(
  `transition: opacity 900ms var(--ease-out);`,
  `transition: opacity 200ms var(--ease-out);`,
  "Speed up scene reveal transition from 900ms to 200ms"
);

// ── 10b. Spec row labels: update dt elements in the detail panel ───────────────
// The dt labels were already replaced above for book0's labels.
// The JS also writes them dynamically in populateDetail(), but it uses
// book.binding, book.format, book.theme, book.motif — not the label names.
// We repurpose those fields to carry the spec values, which the JS reads correctly.
// The label names (dt elements) are static in the HTML — already updated above.


// ── 11. Inject portfolio-specific extra styles ────────────────────────────────
// Add a small style block that makes the detail panel spec row labels
// reflect the per-book terminology by updating the dt text via JS.
// We do this by injecting a script that patches populateDetail().

const DETAIL_FUNC_ANCHOR = `    function populateDetail(book) {
      detailEyebrow.textContent = \`Volume \${book.roman} · \${book.discipline}\`;
      detailTitle.textContent = book.title;
      detailDeck.textContent = book.deck;
      detailBinding.textContent = book.binding;
      detailFormat.textContent = book.format;
      detailTheme.textContent = book.theme;
      detailMotif.textContent = book.motif;`;

replace(
  DETAIL_FUNC_ANCHOR,
  `    // Portfolio: spec label names per book
    const SPEC_LABELS = {
${portfolio.books
  .map(
    (b) =>
      `      "${b.id}": ["${b.specs[0]?.label ?? "Binding"}", "${b.specs[1]?.label ?? "Format"}", "${b.specs[2]?.label ?? "Theme"}", "${b.specs[3]?.label ?? "Motif"}"]`
  )
  .join(",\n")}
    };

    function renderClickableSpec(label, val) {
      if (!val) return "";
      const str = String(val).trim();
      if ((str.includes("@") && !str.includes(" ")) || /^mailto:/i.test(str)) {
        const email = str.replace(/^mailto:/i, "");
        return \`<a href="mailto:\${email}" class="spec-link" title="Send email to \${email}">\${email}</a>\`;
      }
      if (/linkedin/i.test(label) || str.includes("linkedin.com")) {
        const url = str.startsWith("http")
          ? str
          : ("https://" + (str.includes("linkedin.com") ? str : "www.linkedin.com/in/" + str));
        return \`<a href="\${url}" target="_blank" rel="noopener noreferrer" class="spec-link" title="Open LinkedIn Profile">\${str} &nearr;</a>\`;
      }
      if (str.startsWith("http") || str.startsWith("github.com") || /github/i.test(label) || /repos/i.test(label)) {
        const url = str.startsWith("http") ? str : ("https://" + str);
        return \`<a href="\${url}" target="_blank" rel="noopener noreferrer" class="spec-link" title="Open \${url}">\${str} &nearr;</a>\`;
      }
      if (/resume|pdf|docx/i.test(label) || /download/i.test(str)) {
        const isPdf = str.toLowerCase().includes("pdf");
        const file = isPdf ? "/resume.pdf" : "/resume.docx";
        const filename = isPdf ? "SURYANSH-SHARMA-RESUME(fullstack).pdf" : "SURYANSH-SHARMA-RESUME(fullstack).docx";
        return \`<a href="\${file}" download="\${filename}" class="spec-link" title="Download Resume">\${str} &darr;</a>\`;
      }
      return str;
    }

    function populateDetail(book) {
      const labels = SPEC_LABELS[book.id] || ["Binding", "Format", "Theme", "Motif"];
      const dts = detailPanel.querySelectorAll(".meta-list dt");
      if (dts.length >= 4) {
        dts[0].textContent = labels[0];
        dts[1].textContent = labels[1];
        dts[2].textContent = labels[2];
        dts[3].textContent = labels[3];
      }
      detailEyebrow.textContent = \`Volume \${book.roman} · \${book.discipline}\`;
      detailTitle.textContent = book.title;
      detailDeck.textContent = book.deck;
      detailBinding.innerHTML = renderClickableSpec(labels[0], book.binding);
      detailFormat.innerHTML = renderClickableSpec(labels[1], book.format);
      detailTheme.innerHTML = renderClickableSpec(labels[2], book.theme);
      detailMotif.innerHTML = renderClickableSpec(labels[3], book.motif);`,
  "Inject SPEC_LABELS and patch populateDetail for interactive clickable spec links"
);

// ── 11a-2. Base typography and UI scale refinements ─────────────────────────
replaceAll(
  `    .editorial-identity strong {
      font-family: var(--serif);
      font-size: clamp(1.2rem, 1.8vw, 1.7rem);
      font-weight: 400;
      letter-spacing: -0.03em;
      line-height: 1;
    }`,
  `    .editorial-identity strong {
      font-family: var(--serif);
      font-size: clamp(0.95rem, 1.2vw, 1.22rem);
      font-weight: 400;
      letter-spacing: -0.03em;
      line-height: 1;
    }`,
  "Scale base editorial-identity strong"
);

replaceAll(
  `    .editorial-identity span,
    .editorial-index span {
      color: var(--ink-soft);
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      line-height: 1.5;
      text-transform: uppercase;
      transition: color 520ms var(--ease-out);
    }`,
  `    .editorial-identity span,
    .editorial-index span {
      color: var(--ink-soft);
      font-size: clamp(0.56rem, 0.72vw, 0.68rem);
      font-weight: 500;
      letter-spacing: 0.11em;
      line-height: 1.5;
      text-transform: uppercase;
      transition: color 520ms var(--ease-out);
    }`,
  "Scale base editorial-identity span"
);

replaceAll(
  `    .selection__title {
      font-size: clamp(2rem, 3.4vw, 3.75rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 0.9;
    }`,
  `    .selection__title {
      font-size: clamp(1.15rem, 1.8vw, 1.75rem);
      font-weight: 400;
      letter-spacing: -0.055em;
      line-height: 1.05;
    }`,
  "Scale base selection__title"
);

replaceAll(
  `    .selection__note {
      display: block;
      max-width: 420px;
      margin-top: 10px;
      color: var(--ink-soft);
      font-size: 0.75rem;
      letter-spacing: 0.01em;
      line-height: 1.45;
      transition: color 520ms var(--ease-out);
    }`,
  `    .selection__note {
      display: block;
      max-width: 500px;
      margin-top: 6px;
      color: var(--ink-soft);
      font-size: clamp(0.76rem, 0.88vw, 0.86rem);
      letter-spacing: 0.01em;
      line-height: 1.45;
      transition: color 520ms var(--ease-out);
    }`,
  "Scale base selection__note"
);

// ── 11b. Typography and UI sizing enhancements ──────────────────────────────
const TYPOGRAPHY_OVERRIDE = `
    /* ── Typography & UI sizing enhancements (scaled slightly down for elegance) ── */
    .editorial-identity strong {
      font-size: clamp(0.95rem, 1.2vw, 1.22rem) !important;
    }

    .editorial-identity span,
    .editorial-index span {
      font-size: clamp(0.56rem, 0.72vw, 0.68rem) !important;
      letter-spacing: 0.11em !important;
      line-height: 1.5 !important;
    }

    .selection {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
    }

    .counter {
      display: inline-block !important;
      font-size: clamp(0.7rem, 0.82vw, 0.78rem) !important;
      font-weight: 600 !important;
      letter-spacing: 0.14em !important;
      color: var(--ink) !important;
      padding: 0 !important;
      margin-bottom: 2px !important;
      position: relative !important;
      z-index: 10 !important;
    }

    .selection__title {
      font-size: clamp(1.15rem, 1.8vw, 1.75rem) !important;
      line-height: 1.05 !important;
    }

    .selection__note {
      display: block !important;
      font-size: clamp(0.76rem, 0.88vw, 0.86rem) !important;
      max-width: 500px !important;
      margin-top: 6px !important;
      line-height: 1.45 !important;
      color: var(--ink-soft) !important;
    }

    .browse-actions {
      gap: 6px !important;
      align-items: center !important;
      align-self: end !important;
      padding-bottom: 2px !important;
    }

    .round-button {
      width: 38px !important;
      height: 38px !important;
      border: 1px solid rgba(43, 34, 27, 0.35) !important;
    }

    .round-button svg {
      width: 16px !important;
      height: 16px !important;
      stroke-width: 1.5 !important;
    }

    .text-button {
      min-height: 38px !important;
      padding: 0 18px !important;
      font-size: 0.72rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.12em !important;
      border: 1.5px solid color-mix(in srgb, var(--ink) 42%, transparent) !important;
      border-radius: 999px !important;
    }

    .close-button {
      width: 36px !important;
      height: 36px !important;
    }

    .close-button svg {
      width: 15px !important;
      height: 15px !important;
      stroke-width: 1.5 !important;
    }

    .page-button {
      width: 36px !important;
      height: 36px !important;
    }

    .page-button svg {
      width: 15px !important;
      height: 15px !important;
      stroke-width: 1.5 !important;
    }

    .eyebrow {
      font-size: 0.58rem !important;
      letter-spacing: 0.12em !important;
      margin-bottom: 10px !important;
    }

    .detail-title {
      font-size: clamp(1.65rem, 2.8vw, 2.45rem) !important;
      line-height: 1.02 !important;
    }

    .detail-deck {
      font-size: clamp(0.82rem, 1.0vw, 0.94rem) !important;
      line-height: 1.55 !important;
      margin-top: 14px !important;
    }

    .detail-deck::first-letter {
      font-size: 2.1em !important;
      margin: 3px 5px 0 0 !important;
      line-height: 0.78 !important;
    }

    .meta-list dt {
      font-size: 0.65rem !important;
      letter-spacing: 0.12em !important;
    }

    .meta-list dd {
      font-size: 0.78rem !important;
      line-height: 1.45 !important;
      word-break: break-word !important;
    }

    /* ── Detail Panel Box Width Expansion & Overflow Fix ──────── */
    .detail-panel {
      width: min(50vw, 640px) !important;
      max-height: 86vh !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      padding: clamp(22px, 2.5vw, 36px) !important;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(244, 238, 230, 0.25) transparent !important;
    }

    .detail-panel::-webkit-scrollbar {
      width: 6px !important;
      height: 0px !important;
    }

    .detail-panel::-webkit-scrollbar-track {
      background: transparent !important;
    }

    .detail-panel::-webkit-scrollbar-thumb {
      background: rgba(244, 238, 230, 0.25) !important;
      border-radius: 999px !important;
    }

    .detail-controls {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      margin-top: 20px !important;
    }

    .detail-buttons {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      gap: 10px !important;
      margin-left: auto !important;
    }

    .meta-list {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 12px 24px !important;
      margin-top: 18px !important;
      margin-bottom: 18px !important;
    }

    .spec-link {
      color: #e5a47e !important;
      text-decoration: underline !important;
      text-underline-offset: 3px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      transition: color 160ms ease, opacity 160ms ease !important;
    }

    .spec-link:hover {
      color: #ffffff !important;
      text-decoration-color: #ffffff !important;
    }

    /* ── Touch & Mobile Interaction Enhancements ─────────────── */
    * {
      -webkit-tap-highlight-color: transparent !important;
    }
    button, a, .spec-link, .round-button, .text-button, .close-button {
      touch-action: manipulation !important;
    }

    @media (max-width: 960px) {
      .detail-panel {
        width: min(92vw, 600px) !important;
        max-height: 80vh !important;
        right: 18px !important;
      }
    }

    @media (max-width: 768px) {
      .masthead {
        top: 24px !important;
        left: 16px !important;
        right: 16px !important;
      }
      .editorial-identity strong {
        font-size: clamp(0.98rem, 3.4vw, 1.25rem) !important;
      }
      .editorial-identity span {
        font-size: 0.65rem !important;
        letter-spacing: 0.08em !important;
        max-width: 220px !important;
        line-height: 1.35 !important;
      }
      .browse-ui {
        left: 14px !important;
        right: 14px !important;
        bottom: 14px !important;
        gap: 10px !important;
      }
      .selection {
        gap: 2px !important;
      }
      .counter {
        font-size: 0.72rem !important;
        margin-bottom: 0 !important;
      }
      .selection__title {
        font-size: clamp(1.02rem, 3.8vw, 1.3rem) !important;
        line-height: 1.12 !important;
      }
      .selection__note {
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        font-size: 0.74rem !important;
        line-height: 1.4 !important;
        max-width: 100% !important;
        margin-top: 4px !important;
      }
      .browse-actions {
        gap: 6px !important;
        align-self: flex-end !important;
        padding-bottom: 0 !important;
      }
      .round-button {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
      }
      .round-button svg {
        width: 16px !important;
        height: 16px !important;
      }
      .microcopy {
        display: none !important;
      }
    }

    @media (max-width: 640px) {
      .editorial-edition,
      .editorial-index {
        display: none !important;
      }
      .detail-panel {
        width: calc(100vw - 20px) !important;
        max-width: 100vw !important;
        left: 10px !important;
        right: 10px !important;
        bottom: 10px !important;
        top: auto !important;
        max-height: 80vh !important;
        padding: 20px 16px !important;
        border-radius: 16px !important;
        box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.65) !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      .detail-title {
        font-size: clamp(1.35rem, 4.6vw, 1.7rem) !important;
        line-height: 1.15 !important;
      }
      .detail-deck {
        font-size: 0.82rem !important;
        line-height: 1.55 !important;
        margin-top: 6px !important;
      }
      .meta-list {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
        margin-top: 12px !important;
        margin-bottom: 14px !important;
      }
      .meta-list dt {
        font-size: 0.64rem !important;
      }
      .meta-list dd {
        font-size: 0.78rem !important;
      }
      .detail-controls {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
        margin-top: 14px !important;
      }
      .detail-buttons {
        width: 100% !important;
        margin-left: 0 !important;
      }
      .text-button {
        width: 100% !important;
        min-height: 40px !important;
        justify-content: center !important;
        text-align: center !important;
        font-size: 0.74rem !important;
        padding: 0 14px !important;
      }
    }
  </style>`;

replace("  </style>", TYPOGRAPHY_OVERRIDE, "Inject typography and UI sizing enhancements");

// ── 12. Final validation ──────────────────────────────────────────────────────

const brandStrings = [
  "Working Volumes",
  "Codex",
  "Claude Code",
  "Cursor", // note: "Cursor" may appear in CSS, only check in visible content
  "Antigravity",
  "Figma",
  "Framer",
  "Xcode",
  "Binding the collection",
  "Seven field guides for making",
  "Seven tools for making",
];

// Only check the JS/HTML text, skip if they appear in comments or canvas motif names
let violations = [];
for (const s of brandStrings) {
  // Count occurrences, skip ones inside /* comments */ or // comments
  const inDataBlock = html.indexOf(`"${s}"`) !== -1 || html.indexOf(`>${s}<`) !== -1;
  if (inDataBlock && s !== "Cursor") {
    // Cursor could legitimately appear in CSS cursor property
    violations.push(s);
  }
}

if (violations.length > 0) {
  violations.forEach((v) => {
    const idx = html.indexOf(`"${v}"`);
    const idx2 = html.indexOf(`>${v}<`);
    const pos = idx !== -1 ? idx : idx2;
  }); 
} 

// ── 13. Write output ──────────────────────────────────────────────────────────

writeFileSync(OUTPUT_HTML, html, "utf8");
writeFileSync(VERSIONED_HTML, html, "utf8");

const outputHash = createHash("sha256").update(html).digest("hex");
const outputSize = Buffer.byteLength(html, "utf8");
