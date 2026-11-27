# WO – Μόδα, Ομορφιά, Ευεξία (μόνο για γυναίκες)

Εφαρμογή Android που δείχνει σε μορφή reels **πραγματικά άρθρα** από περιοδικά και site μόδας, ομορφιάς και υγείας. Δεν χρησιμοποιεί AI.

- **Reels**: κάθετα ή οριζόντια (κουμπί πάνω δεξιά). Κάθε reel έχει την εικόνα, τον τίτλο και την αρχή του άρθρου, την πηγή και κουμπί «Διάβασε το άρθρο».
- **Κατηγορίες**: Μόδα, Ομορφιά, Υγεία & Ευεξία, Νέα προϊόντα και Αποθηκευμένα (♡).
- **Ανανέωση κάθε ώρα**. Όσο κάνετε scroll, φορτώνονται τα παλαιότερα άρθρα. Το ημερολόγιο ανοίγει το αρχείο, που κρατά 180 ημέρες.
- **Ρώτα τη WO**: γράφετε μια ερώτηση (π.χ. «τι παλτό να διαλέξω») και βλέπετε τα σχετικά άρθρα.
- **Γλώσσα**: στα Ελληνικά δείχνει τα ελληνικά site και στα Αγγλικά τα ξένα περιοδικά. Από τις ρυθμίσεις (κουμπί ΕΛ/EN) μπορείτε να διαλέξετε και «Όλα».

## Πηγές

**Ξένα (18):** Vogue, ELLE, Harper's Bazaar, Glamour, Cosmopolitan, Who What Wear, W Magazine, Teen Vogue, Town & Country, Bustle, Refinery29, Allure, SELF, Women's Health, Prevention, mindbodygreen, Good Housekeeping, Oprah Daily

**Ελληνικά (7):** Harper's Bazaar Greece, Marie Claire Greece, InStyle Greece, Jenny.gr, Woman Idol, Shape.gr, Iatropedia

Οι πηγές βρίσκονται στο `fetcher/feeds.js` και οι λέξεις για τις κατηγορίες στο `fetcher/topics.js`. Άρθρα για ζώδια, πολιτική, κουτσομπολιό ή για άνδρες δεν εμφανίζονται.

## Πώς λειτουργεί

```
Κάθε ώρα, στο GitHub Actions:
  RSS περιοδικών ──► fetcher/update.mjs ──► αρχεία JSON στον κλάδο gh-pages
                                              │
                                              ▼
                              https://<όνομα>.github.io/<repo>/data/...
                                              ▲
Εφαρμογή στο κινητό ───────────────────────────┘
```

Χρειάζεται μόνο λογαριασμός GitHub. Δεν υπάρχει server, κλειδί ή κόστος.

---

# Οδηγός βήμα-βήμα

## Βήμα 1 – Νέο repository στο GitHub
1. Μπείτε στο https://github.com/new
2. **Repository name**: `wo-fashion`
3. Επιλέξτε **Public**. Χρειάζεται για το δωρεάν GitHub Pages.
4. Πατήστε **Create repository**.

## Βήμα 2 – Ανέβασμα των αρχείων
1. Στη σελίδα του νέου repository πατήστε τον σύνδεσμο **uploading an existing file**.
2. Ανοίξτε τον φάκελο `wo-app` στον υπολογιστή, επιλέξτε **όλα** τα περιεχόμενά του (`.github`, `app`, `fetcher`, `README.md`) και σύρετέ τα στη σελίδα.
3. Κάτω κάτω πατήστε **Commit changes**.
4. Έλεγχος: στο repository πρέπει να φαίνεται ο φάκελος `.github`. Αν λείπει, δείτε το «Πρόβλημα Α» στο τέλος.

## Βήμα 3 – Πρώτη συλλογή άρθρων
1. Πατήστε την καρτέλα **Actions**. Αν εμφανιστεί κουμπί «I understand my workflows, go ahead and enable them», πατήστε το.
2. Αριστερά επιλέξτε **Update articles (WO)**.
3. Δεξιά πατήστε **Run workflow** και μετά το πράσινο **Run workflow**.
4. Περιμένετε 1-2 λεπτά να εμφανιστεί πράσινο ✓.

## Βήμα 4 – Ενεργοποίηση GitHub Pages
1. **Settings → Pages**.
2. **Source**: «Deploy from a branch».
3. **Branch**: `gh-pages`, φάκελος `/ (root)` και πατήστε **Save**.
4. Περιμένετε 1-2 λεπτά και ανοίξτε στον browser το `https://<το-όνομά-σας>.github.io/wo-fashion/data/days.json`. Αν δείτε κάτι σαν `["2026-11-27"]`, όλα δουλεύουν.

Από εδώ και πέρα τα άρθρα ανανεώνονται μόνα τους κάθε ώρα.

## Βήμα 5 – Δημιουργία της εφαρμογής Android
1. **Actions → Build Android (WO) → Run workflow**.
2. Στο «Έκδοση» γράψτε `1.0.0` και πατήστε **Run workflow**.
3. Περιμένετε περίπου 5-8 λεπτά να εμφανιστεί πράσινο ✓.
4. Ανοίξτε το run και κατεβείτε στο **Artifacts**. Κατεβάστε το `wo-fashion-1.0.0-…` και αποσυμπιέστε το.
5. Το αρχείο `.apk` εγκαθίσταται στο κινητό για δοκιμή.

## Βήμα 6 (προαιρετικό) – Υπογραφή για το Play Store
Αν θέλετε `.aab` για το Google Play, χρειάζεται keystore. Μπορεί να είναι το ίδιο με την «Πυξίδα Βιταμινών».
**Settings → Secrets and variables → Actions → New repository secret**, τέσσερα secrets:
- `KEYSTORE_BASE64`: το αρχείο keystore σε μορφή base64
- `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

Μετά ξανατρέξτε το Βήμα 5. Αυτή τη φορά θα βγει υπογεγραμμένο `app-release.apk` και `app-release.aab`.

---

## Προβλήματα

**Α. Δεν ανέβηκε ο φάκελος `.github`.**
Πατήστε **Add file → Create new file**. Στο όνομα γράψτε `.github/workflows/articles.yml` και επικολλήστε το περιεχόμενο του αντίστοιχου αρχείου από τον υπολογιστή. Κάντε το ίδιο για το `.github/workflows/android.yml`.

**Β. Το «Update articles» αποτυγχάνει με «Permission denied» ή «403».**
**Settings → Actions → General → Workflow permissions** → επιλέξτε «Read and write permissions» → Save.

**Γ. Μετά από 2 μήνες σταμάτησε η ανανέωση.**
Το GitHub παγώνει τις αυτόματες εργασίες σε repository χωρίς δραστηριότητα και στέλνει email. Πηγαίνετε στο **Actions → Update articles (WO)** και πατήστε **Enable workflow**.

**Δ. Μια πηγή δεν φέρνει άρθρα.**
Στο **Actions → Update articles (WO)** ανοίξτε το τελευταίο run. Στο τέλος του βήματος «Λήψη νέων άρθρων» φαίνονται οι πηγές που απέτυχαν. Μπορείτε να τις αφαιρέσετε από το `fetcher/feeds.js`.

## Αρχεία

| Αρχείο | Τι κάνει |
|---|---|
| `app/www/index.html` | Όλη η εφαρμογή (reels, αρχείο, αναζήτηση, ΕΛ/EN) |
| `app/www/config.json` | Η διεύθυνση των άρθρων. Τη γράφει αυτόματα το Βήμα 5 |
| `fetcher/feeds.js` | Λίστα πηγών |
| `fetcher/topics.js` | Λέξεις για κατηγορίες και αποκλεισμούς |
| `fetcher/parse.js` | Ανάγνωση RSS |
| `fetcher/update.mjs` | Συλλογή άρθρων, εκτελείται κάθε ώρα |
| `.github/workflows/articles.yml` | Ωριαία συλλογή άρθρων → GitHub Pages |
| `.github/workflows/android.yml` | Build APK/AAB |
