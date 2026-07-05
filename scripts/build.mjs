import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const contentDir = join(root, "src", "content");
const distDir = join(root, "dist");
const publicDir = join(root, "public");
const siteUrl = "https://docs.high-horizon.net";

const docs = [
  {
    file: "final-operating-boundary.md",
    slug: "final-operating-boundary",
    titles: {
      en: "High Horizon Final Operating Boundary and Homepage Summary",
      ko: "High Horizon 최종 운영 경계와 홈페이지 정리"
    },
    descriptions: {
      en: "Marketplace operating boundary, homepage copy, AI feature separation, refunds, and outage response",
      ko: "마켓플레이스 운영 경계, 홈페이지 문구, AI 기능 분리, 환불과 정전 대응 정리"
    }
  },
  {
    file: "current-implementation-logic.md",
    slug: "current-implementation-logic",
    titles: {
      en: "High Horizon Current Implementation Logic Analysis",
      ko: "High Horizon 현재 구현 로직 분석"
    },
    descriptions: {
      en: "Code-based map of Django authentication, booking, payment, courses, refunds, and Google Meet integration",
      ko: "Django 구현 기준 인증, 예약, 결제, 코스, 환불, Google Meet 연동 로직 지도"
    }
  }
];

const languages = {
  en: {
    label: "English",
    prefix: "",
    lang: "en",
    navLabel: "Documents",
    brandSub: "Public Docs",
    eyebrow: "Operating Draft",
    homeTitle: "High Horizon Public Operating Documents",
    homeDescription: "Public notes on High Horizon operating boundaries and implementation logic",
    homeIntro: "Marketplace boundaries, homepage copy, refund and make-up rules, Baguio outage response, and current implementation logic are collected in one place.",
    primaryAction: "View Final Operating Boundary",
    secondaryAction: "View Current Implementation Logic",
    cardLabel: "Document",
    docListLabel: "Document list",
    ciSectionLabel: "Brand CI videos",
    ciTitle: "High Horizon Brand CI Videos",
    ciDescription: "Short identity motion assets for the High Horizon public site and handoff materials.",
    footer: "Generated from High Horizon Obsidian documents. This is an operating draft, not legal advice."
  },
  ko: {
    label: "한국어",
    prefix: "/ko",
    lang: "ko",
    navLabel: "문서",
    brandSub: "Public Docs",
    eyebrow: "Operating Draft",
    homeTitle: "High Horizon 공개 운영 문서",
    homeDescription: "High Horizon 운영 경계와 구현 로직을 정리한 공개 문서",
    homeIntro: "학원형 운영으로 보이지 않도록 마켓플레이스 경계, 홈페이지 문구, 환불/보강, Baguio 정전 대응, 현재 구현 로직을 한곳에 모았습니다.",
    primaryAction: "최종 운영 경계 보기",
    secondaryAction: "현재 구현 로직 보기",
    cardLabel: "Document",
    docListLabel: "문서 목록",
    ciSectionLabel: "브랜드 CI 영상",
    ciTitle: "High Horizon 브랜드 CI 영상",
    ciDescription: "High Horizon 공개 사이트와 전달 자료에 사용할 짧은 브랜드 아이덴티티 영상입니다.",
    footer: "Generated from High Horizon Obsidian documents. This is an operating draft, not legal advice."
  }
};

const ciVideos = [
  {
    file: "/videos/01-ci-logo-crown-reveal.mp4",
    width: 1080,
    height: 1920,
    titles: {
      en: "CI Logo Crown Reveal",
      ko: "CI 로고 크라운 리빌"
    },
    descriptions: {
      en: "Primary logo reveal motion asset.",
      ko: "메인 로고 리빌 모션 자산입니다."
    }
  },
  {
    file: "/videos/04-clean-ci-bumper.mp4",
    width: 1080,
    height: 1920,
    titles: {
      en: "Clean CI Bumper",
      ko: "클린 CI 범퍼"
    },
    descriptions: {
      en: "Short clean bumper for quick brand transitions.",
      ko: "짧은 브랜드 전환에 쓰는 클린 범퍼 영상입니다."
    }
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function stripFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return markdown;
  const end = markdown.indexOf("\n---", 3);
  return end === -1 ? markdown : markdown.slice(end + 4).trimStart();
}

function inline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return `<a href="${escapeHtml(href)}">${label}</a>`;
  });
  html = html.replace(/\[\[([^\]]+)\]\]/g, (_match, label) => {
    return `<span class="wiki-link">${escapeHtml(label)}</span>`;
  });
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  return html;
}

function renderTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
    rows.push(lines[i].trim());
    i += 1;
  }
  if (rows.length < 2 || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(rows[1])) {
    return null;
  }
  const split = (row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => inline(cell.trim()));
  const head = split(rows[0]);
  const body = rows.slice(2).map(split);
  const thead = `<thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return { html: `<div class="table-wrap"><table>${thead}${tbody}</table></div>`, next: i };
}

function renderMarkdown(markdown) {
  const lines = stripFrontmatter(markdown).split(/\r?\n/);
  const output = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let listType = null;

  const closeList = () => {
    if (listType) {
      output.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        output.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLang = "";
        codeLines = [];
      } else {
        closeList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
      }
      i += 1;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i += 1;
      continue;
    }

    if (!trimmed) {
      closeList();
      i += 1;
      continue;
    }

    const table = renderTable(lines, i);
    if (table) {
      closeList();
      output.push(table.html);
      i = table.next;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      output.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(trimmed);
    if (unordered) {
      if (listType !== "ul") {
        closeList();
        output.push("<ul>");
        listType = "ul";
      }
      output.push(`<li>${inline(unordered[1])}</li>`);
      i += 1;
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        output.push("<ol>");
        listType = "ol";
      }
      output.push(`<li>${inline(ordered[1])}</li>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeList();
      output.push(`<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      i += 1;
      continue;
    }

    closeList();
    const para = [trimmed];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i].trim()) && !/^[-*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !lines[i].trim().startsWith("```") && !/^\|.*\|$/.test(lines[i].trim())) {
      para.push(lines[i].trim());
      i += 1;
    }
    output.push(`<p>${inline(para.join(" "))}</p>`);
  }

  closeList();
  return output.join("\n");
}

function pagePath(langKey, slug = "index") {
  const prefix = languages[langKey].prefix;
  if (slug === "index") return `${prefix || ""}/`;
  return `${prefix}/${slug}/`.replace("//", "/");
}

function absoluteUrl(langKey, slug = "index") {
  return `${siteUrl}${pagePath(langKey, slug)}`;
}

function layout({ langKey, title, description, body, activeSlug }) {
  const lang = languages[langKey];
  const nav = docs.map((doc) => {
    const href = pagePath(langKey, doc.slug);
    const active = doc.slug === activeSlug ? " aria-current=\"page\"" : "";
    return `<a${active} href="${href}">${escapeHtml(doc.titles[langKey].replace("High Horizon ", ""))}</a>`;
  }).join("");
  const switcher = Object.entries(languages).map(([key, value]) => {
    const href = pagePath(key, activeSlug);
    const active = key === langKey ? " aria-current=\"true\"" : "";
    return `<a${active} href="${href}" hreflang="${value.lang}">${escapeHtml(value.label)}</a>`;
  }).join("");

  return `<!doctype html>
<html lang="${lang.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | High Horizon Docs</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${absoluteUrl(langKey, activeSlug)}">
  <link rel="alternate" hreflang="en" href="${absoluteUrl("en", activeSlug)}">
  <link rel="alternate" hreflang="ko" href="${absoluteUrl("ko", activeSlug)}">
  <link rel="alternate" hreflang="x-default" href="${absoluteUrl("en", activeSlug)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${absoluteUrl(langKey, activeSlug)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${css()}</style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="High Horizon Docs">
      <span class="brand-mark">HH</span>
      <span><strong>High Horizon</strong><small>${escapeHtml(lang.brandSub)}</small></span>
    </a>
    <div class="header-actions">
      <nav class="doc-nav" aria-label="${escapeHtml(lang.navLabel)}">${nav}</nav>
      <nav class="language-switch" aria-label="Language">${switcher}</nav>
    </div>
  </header>
  ${body}
  <footer class="site-footer">
    <p>${escapeHtml(lang.footer)}</p>
  </footer>
</body>
</html>`;
}

function css() {
  return `
:root{color-scheme:light;--bg:#fbfbf8;--surface:#fff;--text:#202124;--muted:#5f6368;--line:#dedbd2;--green:#2e7d5b;--blue:#315f9f;--amber:#b56a15;--radius:8px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.75 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Noto Sans KR",sans-serif;word-break:keep-all;overflow-wrap:break-word}
a{color:var(--blue);text-decoration-thickness:1px;text-underline-offset:3px}
.site-header{position:sticky;top:0;z-index:10;display:flex;gap:24px;align-items:center;justify-content:space-between;padding:14px clamp(18px,4vw,48px);border-bottom:1px solid var(--line);background:rgba(255,255,255,.94);backdrop-filter:saturate(1.2) blur(10px)}
.brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}
.brand-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:8px;background:var(--text);color:white;font-weight:800;font-size:13px}
.brand strong,.brand small{display:block;line-height:1.1}.brand small{margin-top:3px;color:var(--muted);font-size:12px}
.header-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:flex-end}
.doc-nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.doc-nav a{padding:7px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--text);font-size:14px;text-decoration:none}
.doc-nav a[aria-current=page]{border-color:var(--green);color:var(--green);font-weight:700}
.language-switch{display:flex;gap:4px;padding:3px;border:1px solid var(--line);border-radius:999px;background:#f7f6f1}
.language-switch a{padding:5px 9px;border-radius:999px;color:var(--muted);font-size:13px;font-weight:700;text-decoration:none}
.language-switch a[aria-current=true]{background:var(--text);color:white}
.hero{padding:72px clamp(18px,4vw,48px) 44px;border-bottom:1px solid var(--line)}
.hero-inner{max-width:1120px;margin:0 auto}
.eyebrow{margin:0 0 12px;color:var(--green);font-weight:800;letter-spacing:0;text-transform:uppercase;font-size:13px}
h1{max-width:920px;margin:0;font-size:clamp(2rem,5vw,3.6rem);line-height:1.08;letter-spacing:0}
.hero p{max-width:780px;color:var(--muted);font-size:18px}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.button{display:inline-flex;align-items:center;min-height:42px;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-weight:700;text-decoration:none}
.button.primary{border-color:var(--green);background:var(--green);color:white}
.doc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:1120px;margin:0 auto;padding:34px clamp(18px,4vw,48px) 60px}
.doc-card{display:flex;flex-direction:column;gap:10px;min-height:190px;padding:22px;border:1px solid var(--line);border-radius:8px;background:var(--surface);text-decoration:none;color:var(--text)}
.doc-card:hover,.doc-card:focus-visible{border-color:var(--green);outline:0}
.doc-card small{color:var(--green);font-weight:800}.doc-card h2{margin:0;font-size:24px;line-height:1.25}.doc-card p{margin:0;color:var(--muted)}
.ci-section{padding:0 clamp(18px,4vw,48px) 72px}
.ci-inner{display:grid;grid-template-columns:minmax(220px,320px) minmax(0,1fr);gap:22px;max-width:1120px;margin:0 auto}
.ci-copy h2{margin:0;font-size:28px;line-height:1.25}.ci-copy p:last-child{margin-bottom:0;color:var(--muted)}
.ci-video-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ci-video-card{overflow:hidden;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
.ci-video-card video{display:block;width:100%;height:auto;aspect-ratio:9/16;background:#202124;object-fit:cover}
.ci-video-card div{padding:14px 16px}.ci-video-card h3{margin:0 0 4px;font-size:18px;line-height:1.3}.ci-video-card p{margin:0 0 8px;color:var(--muted);font-size:14px;line-height:1.6}.ci-video-card a{font-size:14px;font-weight:700}
.article-shell{display:grid;grid-template-columns:minmax(0,1fr);max-width:1120px;margin:0 auto;padding:40px clamp(18px,4vw,48px) 72px}
article{max-width:780px;width:100%;margin:0 auto}
article h1{font-size:clamp(1.9rem,4vw,2.8rem);margin-bottom:22px}
article h2{margin:48px 0 12px;font-size:28px;line-height:1.25}
article h3{margin:32px 0 10px;font-size:21px;line-height:1.3}
article h4{margin:24px 0 8px;font-size:17px}
article p,article li{color:#2f3133}
article ul,article ol{padding-left:1.35rem}
article li+li{margin-top:6px}
blockquote{margin:22px 0;padding:14px 16px;border-left:4px solid var(--amber);background:#fff8ef;color:#47331b}
pre{overflow:auto;margin:18px 0;padding:16px;border:1px solid var(--line);border-radius:8px;background:#f3f1eb;color:#252525;line-height:1.55;white-space:pre-wrap}
code{font-family:"SFMono-Regular",Consolas,monospace;font-size:.92em}
p code,li code{padding:2px 5px;border-radius:5px;background:#efede6}
.table-wrap{overflow-x:auto;margin:18px 0;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
table{width:100%;border-collapse:collapse;min-width:620px}
th,td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
th{background:#f5f7f1;color:#1f4d38}
tr:last-child td{border-bottom:0}
.wiki-link{color:var(--green);font-weight:700}
.site-footer{padding:24px clamp(18px,4vw,48px);border-top:1px solid var(--line);color:var(--muted);font-size:14px;text-align:center}
@media (max-width:900px){.ci-inner{grid-template-columns:1fr}.ci-copy{max-width:560px}}
@media (max-width:720px){.site-header{position:static;align-items:flex-start;flex-direction:column}.header-actions{justify-content:flex-start}.doc-nav{justify-content:flex-start}.doc-grid,.ci-video-grid{grid-template-columns:1fr}.hero{padding-top:44px}.hero p{font-size:16px}article h2{font-size:24px}}
`;
}

function writePage(langKey, slug, html) {
  const dir = slug === "index"
    ? join(distDir, languages[langKey].prefix)
    : join(distDir, languages[langKey].prefix, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function copyPublicDir(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyPublicDir(sourcePath, targetPath);
    } else if (entry.isFile()) {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
copyPublicDir(publicDir, distDir);

for (const langKey of Object.keys(languages)) {
  const lang = languages[langKey];
  const cards = docs.map((doc) => `<a class="doc-card" href="${pagePath(langKey, doc.slug)}">
    <small>${escapeHtml(lang.cardLabel)}</small>
    <h2>${escapeHtml(doc.titles[langKey])}</h2>
    <p>${escapeHtml(doc.descriptions[langKey])}</p>
  </a>`).join("");
  const videos = ciVideos.map((video) => `<article class="ci-video-card">
    <video controls playsinline preload="metadata" width="${video.width}" height="${video.height}" aria-label="${escapeHtml(video.titles[langKey])}">
      <source src="${video.file}" type="video/mp4">
    </video>
    <div>
      <h3>${escapeHtml(video.titles[langKey])}</h3>
      <p>${escapeHtml(video.descriptions[langKey])}</p>
      <a href="${video.file}">MP4</a>
    </div>
  </article>`).join("");

  writePage(langKey, "index", layout({
    langKey,
    activeSlug: "index",
    title: lang.homeTitle,
    description: lang.homeDescription,
    body: `<main>
      <section class="hero"><div class="hero-inner">
        <p class="eyebrow">${escapeHtml(lang.eyebrow)}</p>
        <h1>${escapeHtml(lang.homeTitle)}</h1>
        <p>${escapeHtml(lang.homeIntro)}</p>
        <div class="actions">
          <a class="button primary" href="${pagePath(langKey, "final-operating-boundary")}">${escapeHtml(lang.primaryAction)}</a>
          <a class="button" href="${pagePath(langKey, "current-implementation-logic")}">${escapeHtml(lang.secondaryAction)}</a>
        </div>
      </div></section>
      <section class="doc-grid" aria-label="${escapeHtml(lang.docListLabel)}">${cards}</section>
      <section class="ci-section" aria-label="${escapeHtml(lang.ciSectionLabel)}">
        <div class="ci-inner">
          <div class="ci-copy">
            <p class="eyebrow">${escapeHtml(lang.ciSectionLabel)}</p>
            <h2>${escapeHtml(lang.ciTitle)}</h2>
            <p>${escapeHtml(lang.ciDescription)}</p>
          </div>
          <div class="ci-video-grid">${videos}</div>
        </div>
      </section>
    </main>`
  }));

  for (const doc of docs) {
    const markdown = readFileSync(join(contentDir, langKey, doc.file), "utf8");
    writePage(langKey, doc.slug, layout({
      langKey,
      activeSlug: doc.slug,
      title: doc.titles[langKey],
      description: doc.descriptions[langKey],
      body: `<main class="article-shell"><article>${renderMarkdown(markdown)}</article></main>`
    }));
  }
}

const sitemap = Object.keys(languages).flatMap((langKey) => [
  absoluteUrl(langKey),
  ...docs.map((doc) => absoluteUrl(langKey, doc.slug))
])
  .map((loc) => `<url><loc>${loc}</loc></url>`)
  .join("");
writeFileSync(join(distDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);

if (!existsSync(join(distDir, "index.html"))) {
  throw new Error(`Build failed: ${basename(distDir)} index.html missing`);
}
