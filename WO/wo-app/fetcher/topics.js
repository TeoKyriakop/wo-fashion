// Λέξεις-κλειδιά για την κατάταξη των άρθρων (χωρίς AI).
// Γράφονται χωρίς τόνους και πεζά. Ταιριάζουν στην αρχή λέξης,
// άρα το "ρουχ" πιάνει "ρούχα", "ρούχων" κ.λπ.
// Αν τελειώνουν σε "_", πρέπει να είναι ολόκληρη λέξη ("υπνο_" δεν πιάνει "υπνοδωμάτιο").

export const TOPICS = {
  products: [
    "launch", "new collection", "new line", "new fragrance", "new perfume", "new scent", "new lipstick", "collab",
    "collaboration", "just dropped", "just launched", "debuts", "first look", "gift guide", "gift ideas", "gifts for",
    "λανσαρ", "νεα σειρα", "νεα συλλογη", "νεα κολεξιον", "νεο αρωμα", "νεα αρωματα", "νεο προιον", "νεα προιοντα",
    "κυκλοφορ", "ιδεες δωρων", "ιδεες για δωρα", "δωρα που", "τα δωρα",
  ],
  fashion: [
    "fashion", "style", "styling", "outfit", "wear", "dress", "jeans", "denim", "coat", "jacket", "blazer", "boot",
    "shoe", "sneaker", "heel", "loafer", "flats", "pumps", "mules", "sandal", "scarf", "gloves", "bag", "handbag",
    "trend", "runway", "wardrobe", "street style", "skirt", "sweater", "knit", "cardigan", "accessor", "jewel",
    "earring", "necklace", "red carpet", "capsule", "lingerie", "swimsuit", "clothing", "clutch",
    "μοδα", "στυλ", "στιλ_", "ντυσιμ", "εμφανιση", "εμφανισεις", "ρουχ", "φορεμα", "φορεσ", "τζιν", "παλτο", "μπουφαν", "σακακ",
    "μποτ", "παπουτσ", "γοβ", "τσαντ", "ταση_", "τασεις_", "γκαρνταρομπ", "φουστ", "πουλοβερ", "πλεκτ", "αξεσουαρ",
    "κοσμημ", "σκουλαρικ", "κολιε", "κασκολ", "γαντια", "συνδυασ", "look", "outfit", "sneakers",
  ],
  beauty: [
    "beauty", "makeup", "make-up", "skin", "skincare", "serum", "moisturi", "sunscreen", "spf", "hair", "haircut", "bob",
    "nail", "manicure", "lipstick", "lip ", "mascara", "foundation", "concealer", "blush", "fragrance", "perfume",
    "retinol", "acne", "wrinkle", "glow", "facial", "brow", "lash",
    "ομορφι", "μακιγιαζ", "δερμα", "επιδερμιδ", "ορος", "ορου", "κρεμα", "αντηλιακ", "μαλλι", "κουρεμα", "χτενισ",
    "νυχι", "νυχια", "μανικιουρ", "κραγιον", "χειλ", "μασκαρα", "αρωμα_", "αρωματα_", "αρωματοσ_", "ρυτιδ", "ακμη",
    "περιποιηση", "βαφη", "κυτταριτιδ", "βλεμμα", "μακια", "σκιεσ ματιων", "beauty", "cellulite",
    "skincare", "makeup",
  ],
  health: [
    "health", "wellness", "wellbeing", "well-being", "workout", "exercise", "fitness", "yoga", "pilates", "walking",
    "diet", "nutrition", "protein", "fiber", "sleep", "stress", "anxiety", "menopause", "perimenopause", "period",
    "pregnan", "fertility", "hormone", "gut", "weight", "heart", "vitamin", "mental", "cholesterol", "blood sugar",
    "breast", "therapy", "recipe", "meditat", "longevity",
    "υγει", "ευεξι", "ασκηση", "ασκησεις", "γυμναστ", "γιογκα", "πιλατες", "περπατημ", "διατροφ", "πρωτειν",
    "υπνο_", "υπνου_", "υπνοσ_", "αυπνι", "αγχοσ_", "αγχουσ_", "εμμηνοπαυσ", "περιοδο_", "εμμηνορρυσ", "εγκυμοσ",
    "γονιμοτ", "ορμον", "εντερ", "κιλα_", "αδυνατισμ", "απωλεια βαρουσ", "καρδια_", "καρδιασ_", "καρδιαγγει",
    "βιταμιν", "ψυχικ", "χοληστερ", "σακχαρ", "καρκινο", "διαιτ", "θερμιδ", "διαλογισ", "μεταβολισμ", "ανοσοποιητ",
    "burnout", "εξουθενωσ", "πεψη", "φουσκωμα",
  ],
};

// Άρθρα με αυτές τις λέξεις στον τίτλο δεν εμφανίζονται
export const EXCLUDE = [
  "horoscope", "zodiac", "astrology", "tarot", "election", "politic", "trump", "football", "nfl", "nba",
  "murder", "shooting", "dog show", "men's", "for men", "menswear", "his ", "boys", "for him", "for dad", "toys",
  "gamers", "for pets", "season 2", "season 3", "season 4", "release date", "first look:",
  "αγορια", "για τον μπαμπα", "παιχνιδια",
  "ζωδι", "ωροσκοπ", "αστρολογ", "τυχερες ωρες", "εκλογ", "πολιτικ", "ποδοσφ", "δολοφον", "εγκλημ", "ανδρικ", "για ανδρες",
];

// Ενότητες των site που δεν αφορούν την εφαρμογή (σπίτι, ταξίδια, ζώδια κ.λπ.)
const EXCLUDE_URL = /\/(living|lifestyle-homes|home|homes|decor|interiors|travel|horoscopes?|astrology|zodia|zwdia|politics|news\/politics)(\/|$)/i;

export function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ς/g, "σ");
}

const cache = new Map();
function matcher(word) {
  if (!cache.has(word)) {
    const whole = word.endsWith("_");
    const w = normalize(whole ? word.slice(0, -1) : word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cache.set(word, new RegExp(`(^|[^\\p{L}\\p{N}])${w}${whole ? "(?![\\p{L}\\p{N}])" : ""}`, "u"));
  }
  return cache.get(word);
}
const hits = (text, words) => words.reduce((n, w) => n + (matcher(w).test(text) ? 1 : 0), 0);

// Επιστρέφει "fashion" | "beauty" | "health" | "products" ή null (= να μη δημοσιευτεί)
export function classify(item, feed) {
  const title = normalize(item.title);
  const tags = normalize(item.tags.join(" | "));
  const body = normalize(item.text);
  if (hits(title, EXCLUDE) || hits(tags, EXCLUDE)) return null;
  if (EXCLUDE_URL.test(item.link || "")) return null;

  if (hits(title, TOPICS.products)) return "products";

  let best = null, bestScore = 0;
  for (const cat of ["fashion", "beauty", "health"]) {
    const score = hits(title, TOPICS[cat]) * 3 + hits(tags, TOPICS[cat]) * 2 + hits(body, TOPICS[cat]);
    if (score > bestScore) { best = cat; bestScore = score; }
  }
  if (bestScore >= 2) return best;
  return feed.category || null;
}
