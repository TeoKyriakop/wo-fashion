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
import { parseFeed, decode } from "./parse.js";

const KEEP_DAYS = 180;      // ημέρες αρχείου
const SEEN_LIMIT = 8000;    // μνήμη συνδέσμων για να μη διπλο-εμφανίζονται άρθρα
const SEARCH_LIMIT = 2500;  // πόσα πρόσφατα άρθρα μπαίνουν στην αναζήτηση
const OG_IMAGE_LIMIT = 40;  // πόσες σελίδες ανοίγει ανά ανανέωση για να βρει εικόνα
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

  // Εικόνα από τη σελίδα του άρθρου όπου λείπει από το RSS
  const noImage = fresh.filter((it) => !it.image).slice(0, OG_IMAGE_LIMIT);
  await Promise.all(noImage.map(async (it) => (it.image = await fetchOgImage(it.link))));

  const reels = fresh.map((it) => ({
    id: it.id,
    category: it.category,
    lang: it.feed.lang,
    source: it.feed.name,
    url: it.link,
    image: it.image || null,
    title: it.title,
    excerpt: it.excerpt,
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
  await writeJSON(join(dataDir, "state.json"), { updated: new Date().toISOString(), seen: [...seen].slice(-SEEN_LIMIT) });

  const byCat = reels.reduce((m, r) => ((m[r.category] = (m[r.category] || 0) + 1), m), {});
  console.log(`Ελέγχθηκαν ${items.length} άρθρα, νέα: ${reels.length}`, byCat);
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

async function fetchOgImage(link) {
  try {
    const r = await fetchWithTimeout(link, 8000);
    if (!r.ok) return null;
    const html = (await r.text()).slice(0, 300000);
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? decode(m[1]) : null;
  } catch {
    return null;
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
