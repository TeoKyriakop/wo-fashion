// Ανάγνωση RSS/Atom χωρίς βιβλιοθήκες (δουλεύει σε Node και σε browser).

export function parseFeed(xml, feed, excerptLen = 260) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 30).map((b) => {
    const content = tag(b, "content:encoded") || tag(b, "content") || "";
    const desc = tag(b, "description") || tag(b, "summary") || "";
    let link = tag(b, "link");
    // <link>url</link>, <link href="url"/> (Atom) ή <a10:link href="url"/>
    if (!link || link.includes("<")) link = attr(b, "(?:\\w+:)?link", "href");
    link = decode(link || "").trim();
    const date = Date.parse(
      tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "a10:updated") || tag(b, "dc:date") || "",
    );
    const text = clean(desc) || clean(content);
    // Σύντομη περίληψη: οι πρώτες παράγραφοι του άρθρου, αν το RSS έχει όλο το κείμενο
    const fromContent = buildSummary(paragraphs(decode(content)));
    const fromDesc = shorten(clean(desc), SUMMARY_MAX);
    return {
      feed,
      id: hashKey(link),
      title: clean(tag(b, "title")),
      link,
      tags: [...b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((m) => clean(m[1])),
      text: text.slice(0, 1500),
      excerpt: shorten(text, excerptLen),
      summary: fromContent.length > fromDesc.length ? fromContent : fromDesc,
      image:
        attr(b, "media:content", "url") || attr(b, "media:thumbnail", "url") || imageEnclosure(b) ||
        firstImg(content) || firstImg(desc) || null,
      date: isNaN(date) ? Date.now() : Math.min(date, Date.now()),
    };
  });
}

/* ---------- Περίληψη ---------- */

const SUMMARY_MIN = 420;  // συνεχίζει να προσθέτει παραγράφους μέχρι εδώ
const SUMMARY_MAX = 650;  // ανώτατο μήκος (χαρακτήρες)
const JUNK = /cookie|subscribe|newsletter|sign up|sign-up|εγγραφ|διαβάστε επίσης|read more|related:|photo:|φωτογραφ(ία|ίες):|©|all rights reserved|affiliate|commission|we may earn|getty images|instagram\.com|ακολουθήστε μας|πατήστε εδώ|click here/i;

// Παράγραφοι κειμένου από HTML (χωρίς μενού, λεζάντες, διαφημίσεις κ.λπ.)
export function paragraphs(html) {
  if (!html) return [];
  let h = html.replace(/<(script|style|noscript|svg|figure|figcaption|aside|nav|header|footer|form|button|iframe)[\s\S]*?<\/\1>/gi, " ");
  const art = h.match(/<article[\s\S]*?<\/article>/gi);
  if (art) h = art.sort((a, b) => b.length - a.length)[0];
  return [...h.matchAll(/<p[\s>][\s\S]*?<\/p>/gi)]
    .map((m) => clean(m[0]))
    .filter((p) => p.length >= 60 && !JUNK.test(p));
}

// Ενώνει τις πρώτες παραγράφους και κόβει σε τέλος πρότασης
export function buildSummary(paras) {
  let s = "";
  for (const p of paras) {
    s = s ? s + " " + p : p;
    if (s.length >= SUMMARY_MIN) break;
  }
  if (s.length <= SUMMARY_MAX) return s;
  const cut = s.slice(0, SUMMARY_MAX);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("; "));
  return end > SUMMARY_MIN * 0.6 ? cut.slice(0, end + 1) : shorten(s, SUMMARY_MAX);
}

// Περίληψη από τη σελίδα του άρθρου (όταν το RSS δίνει μόνο μία πρόταση)
export function pageSummary(html) {
  return buildSummary(paragraphs(html));
}

function shorten(s, n) {
  // αφαιρεί τα «The post ... appeared first on ...» των WordPress feeds
  s = s.replace(/The post .* appeared first on .*$/i, "").replace(/Το άρθρο .* εμφανίστηκε πρώτα .*$/i, "").trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), n - 20)).replace(/[,.;:\s]+$/, "") + "…";
}
function tag(s, name) {
  const m = s.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1].replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").trim() : "";
}
function attr(s, name, a) {
  const m = s.match(new RegExp(`<${name}\\s[^>]*?${a}=["']([^"']+)["']`, "i"));
  return m ? decode(m[1]) : "";
}
function imageEnclosure(s) {
  const m = s.match(/<enclosure\s[^>]*>/i);
  if (!m || !/type=["']image/i.test(m[0])) return "";
  const u = m[0].match(/url=["']([^"']+)["']/i);
  return u ? decode(u[1]) : "";
}
function firstImg(html) {
  const m = decode(html || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? decode(m[1]) : "";
}
// Ονόματα HTML (π.χ. &alpha; &rsquo;) -> χαρακτήρες. Κάποια ελληνικά site γράφουν έτσι όλο το κείμενο.
const GREEK = "Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron Pi Rho - Sigma Tau Upsilon Phi Chi Psi Omega".split(" ");
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", middot: "·", bull: "•", copy: "©", reg: "®", trade: "™",
  deg: "°", euro: "€", pound: "£", eacute: "é", egrave: "è", aacute: "á", oacute: "ó", iacute: "í", uacute: "ú",
  ntilde: "ñ", ccedil: "ç", ouml: "ö", uuml: "ü", auml: "ä", sigmaf: "ς", thetasym: "ϑ" };
GREEK.forEach((name, i) => {
  if (name === "-") return;
  NAMED[name] = String.fromCodePoint(0x391 + i);
  NAMED[name.toLowerCase()] = String.fromCodePoint(0x3b1 + i);
});

export function decode(s) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&([a-z]+);/gi, (m, name) => (name in NAMED ? NAMED[name] : m));
}
export function clean(s) {
  // οι «μέσα στη γραμμή» ετικέτες (span, a, b…) αφαιρούνται χωρίς κενό, οι υπόλοιπες γίνονται κενό
  const strip = (x) => x.replace(/<\/?(span|a|b|strong|em|i|u|sup|sub|mark)(\s[^>]*)?>/gi, "").replace(/<[^>]+>/g, " ");
  return strip(decode(strip(s || "")))
    // κωδικοί του WordPress, π.χ. [caption id="..."] ... [/caption]
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, " ")
    .replace(/\[\/?[a-z_]+(\s[^\]]*)?\]/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?»”)·])/g, "$1")
    .replace(/([«“‘(])\s+/g, "$1")
    .trim();
}
function hashKey(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36) + s.length.toString(36);
}
