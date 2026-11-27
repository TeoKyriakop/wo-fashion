// WO – συλλογή άρθρων (χωρίς AI)
// Τρέχει κάθε ώρα στο GitHub Actions: διαβάζει τα RSS των περιοδικών, κατατάσσει τα άρθρα
// με λέξεις-κλειδιά και γράφει αρχεία JSON που δημοσιεύονται στο GitHub Pages.
//
// Χρήση:  node fetcher/update.mjs <φάκελος-εξόδου>
// Γράφει:
//   data/days.json              -> οι ημέρες του αρχείου (νεότερη πρώτη)
//   data/day/YYYY-MM-DD.json    -> τα άρθρα κάθε ημέρας
//   data/search.json            -> τα πιο πρόσφατα άρθρα, για την αναζήτηση
//   data/state.json             -> σύνδεσμοι που έχουν ήδη ελεγχθεί

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { FEEDS } from "./feeds.js";
import { classify } from "./topics.js";
import { parseFeed, decode, pageSummary } from "./parse.js";

const KEEP_DAYS = 180;      // ημέρες αρχείου
const SEEN_LIMIT = 8000;    // μνήμη συνδέσμων για να μη διπλο-εμφανίζονται άρθρα
const SEARCH_LIMIT = 3000;  // πόσα πρόσφατα άρθρα μπαίνουν στην αναζήτηση
const PAGE_LIMIT = 120;     // πόσες σελίδες άρθρων ανοίγει ανά ανανέωση (για εικόνα και περίληψη)
const BACKFILL_LIMIT = 100; // πόσα παλαιότερα άρθρα χωρίς περίληψη συμπληρώνει ανά ανανέωση
const EXCERPT = 260;        // μήκος αποσπάσματος (χαρακτήρες)

const out = process.argv[2] || "site";
const dataDir = join(out, "data");

async function readJSON(file, fallback) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; }
}
const writeJSON = (file, data) => writeFile(file, JSON.stringify(data));
const todayAthens = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens" }).format(new Date());

async function main() {
  await mkdir(join(dataDir, "day"), { recursive: true });
  await writeFile(join(out, ".nojekyll"), "");

  const state = await readJSON(join(dataDir, "state.json"), { seen: [] });
  const seen = new Set(state.seen);

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const failed = [];
  const items = [];
  results.forEach((r, i) => (r.status === "fulfilled" ? items.push(...r.value) : failed.push(`${FEEDS[i].name}: ${r.reason?.message}`)));

  const fresh = [];
  for (const it of items) {
    if (!it.link || seen.has(it.id)) continue;
    seen.add(it.id); // και τα απορριφθέντα, για να μην ξαναελεγχθούν
    const category = classify(it, it.feed);
    if (category) fresh.push({ ...it, category });
  }
  fresh.sort((a, b) => b.date - a.date);

  // Όπου το RSS δεν έχει εικόνα ή αρκετό κείμενο για περίληψη, ανοίγουμε τη σελίδα του άρθρου
  const needPage = fresh.filter((it) => !it.image || it.summary.length < 300).slice(0, PAGE_LIMIT);
  await pool(needPage, 8, async (it) => {
    const page = await fetchPage(it.link);
    if (!page) return;
    if (!it.image) it.image = page.image;
    if (page.summary.length > it.summary.length) it.summary = page.summary;
  });

  const reels = fresh.map((it) => ({
    id: it.id,
    category: it.category,
    lang: it.feed.lang,
    source: it.feed.name,
    url: it.link,
    image: it.image || null,
    title: it.title,
    excerpt: it.excerpt,
    // η περίληψη αποθηκεύεται μόνο αν λέει κάτι παραπάνω από το απόσπασμα
    summary: it.summary.length > it.excerpt.length + 40 ? it.summary : undefined,
    published: new Date(it.date).toISOString(),
  }));

  let days = await readJSON(join(dataDir, "days.json"), []);
  if (reels.length) {
    const day = todayAthens();
    const file = join(dataDir, "day", day + ".json");
    const existing = await readJSON(file, []);
    await writeJSON(file, [...reels, ...existing]);

    if (!days.includes(day)) days.push(day);
    days.sort().reverse();
    for (const d of days.slice(KEEP_DAYS)) await rm(join(dataDir, "day", d + ".json"), { force: true });
    days = days.slice(0, KEEP_DAYS);

    const index = await readJSON(join(dataDir, "search.json"), []);
    await writeJSON(join(dataDir, "search.json"), [...reels, ...index].slice(0, SEARCH_LIMIT));
  }
  await writeJSON(join(dataDir, "days.json"), days);

  // Συμπλήρωση περιλήψεων σε παλαιότερα άρθρα που δεν έχουν (λίγα σε κάθε εκτέλεση)
  const tried = new Set(state.tried || []);
  const filled = await backfillSummaries(days, tried);

  await writeJSON(join(dataDir, "state.json"), {
    updated: new Date().toISOString(),
    seen: [...seen].slice(-SEEN_LIMIT),
    tried: [...tried].slice(-SEEN_LIMIT),
  });

  const byCat = reels.reduce((m, r) => ((m[r.category] = (m[r.category] || 0) + 1), m), {});
  console.log(`Ελέγχθηκαν ${items.length} άρθρα, νέα: ${reels.length}`, byCat);
  console.log(`Περιλήψεις σε παλαιότερα άρθρα: ${filled}`);
  if (failed.length) console.log("Πηγές που απέτυχαν:\n  " + failed.join("\n  "));
}

/* ------------------------------------------------------------------ */
/* RSS                                                                 */
/* ------------------------------------------------------------------ */

async function fetchWithTimeout(url, ms = 15000) {
  return fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WOReader/1.0)" },
  });
}

async function fetchFeed(feed) {
  const r = await fetchWithTimeout(feed.url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return parseFeed(await r.text(), feed, EXCERPT);
}

// Βρίσκει άρθρα χωρίς περίληψη (τα πιο πρόσφατα πρώτα), ανοίγει τη σελίδα τους και
// γράφει την περίληψη στο search.json και στο αρχείο της ημέρας τους.
// Όσα δοκιμάστηκαν (με ή χωρίς επιτυχία) μπαίνουν στο `tried`, για να μην ξαναδοκιμαστούν.
async function backfillSummaries(days, tried) {
  const searchFile = join(dataDir, "search.json");
  const index = await readJSON(searchFile, []);
  const todo = index.filter((r) => !r.summary && r.url && !tried.has(r.id)).slice(0, BACKFILL_LIMIT);
  if (!todo.length) return 0;

  const found = new Map();
  await pool(todo, 8, async (r) => {
    tried.add(r.id);
    const page = await fetchPage(r.url);
    if (page && page.summary.length > (r.excerpt || "").length + 40) found.set(r.id, page.summary);
  });
  if (!found.size) return 0;

  for (const r of index) if (found.has(r.id)) r.summary = found.get(r.id);
  await writeJSON(searchFile, index);

  // ίδια περίληψη και στα αρχεία των ημερών (ψάχνουμε από τη νεότερη ημέρα)
  const left = new Set(found.keys());
  for (const d of days) {
    if (!left.size) break;
    const file = join(dataDir, "day", d + ".json");
    const list = await readJSON(file, null);
    if (!list) continue;
    let changed = false;
    for (const r of list) {
      if (left.has(r.id)) { r.summary = found.get(r.id); left.delete(r.id); changed = true; }
    }
    if (changed) await writeJSON(file, list);
  }
  return found.size;
}

// Σελίδα άρθρου -> { image, summary }
async function fetchPage(link) {
  try {
    const r = await fetchWithTimeout(link, 10000);
    if (!r.ok) return null;
    const html = (await r.text()).slice(0, 800000);
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return { image: m ? decode(m[1]) : null, summary: pageSummary(html) };
  } catch {
    return null;
  }
}

// Εκτελεί τη δουλειά για όλα τα στοιχεία, το πολύ `n` ταυτόχρονα
async function pool(list, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < list.length) await fn(list[i++]);
  }));
}

main().catch((e) => { console.error(e); process.exit(1); });
