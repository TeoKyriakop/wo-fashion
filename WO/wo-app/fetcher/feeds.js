// Πηγές άρθρων (RSS). Μπορείτε να προσθέσετε ή να αφαιρέσετε γραμμές.
//  lang:     "el" = ελληνικό site, "en" = ξένο
//  category: αν το site γράφει μόνο για ένα θέμα, τα άρθρα του που δεν ταιριάζουν
//            σε καμία λέξη-κλειδί μπαίνουν σε αυτή την κατηγορία. Αν είναι null,
//            τα άρθρα χωρίς σχετικές λέξεις παραλείπονται (π.χ. γενικά νέα).
export const FEEDS = [
  // ---------- Ξένα περιοδικά ----------
  { name: "Vogue", lang: "en", url: "https://www.vogue.com/feed/rss", category: null },
  { name: "ELLE", lang: "en", url: "https://www.elle.com/rss/all.xml/", category: null },
  { name: "Harper's Bazaar", lang: "en", url: "https://www.harpersbazaar.com/rss/all.xml/", category: null },
  { name: "Glamour", lang: "en", url: "https://www.glamour.com/feed/rss", category: null },
  { name: "Cosmopolitan", lang: "en", url: "https://www.cosmopolitan.com/rss/all.xml/", category: null },
  { name: "Who What Wear", lang: "en", url: "https://www.whowhatwear.com/rss", category: "fashion" },
  { name: "W Magazine", lang: "en", url: "https://www.wmagazine.com/rss", category: null },
  { name: "Teen Vogue", lang: "en", url: "https://www.teenvogue.com/feed/rss", category: null },
  { name: "Town & Country", lang: "en", url: "https://www.townandcountrymag.com/rss/all.xml/", category: null },
  { name: "Bustle", lang: "en", url: "https://www.bustle.com/rss", category: null },
  { name: "Refinery29", lang: "en", url: "https://www.refinery29.com/en-us/rss.xml", category: null },
  { name: "Allure", lang: "en", url: "https://www.allure.com/feed/rss", category: "beauty" },
  { name: "SELF", lang: "en", url: "https://www.self.com/feed/rss", category: "health" },
  { name: "Women's Health", lang: "en", url: "https://www.womenshealthmag.com/rss/all.xml/", category: "health" },
  { name: "Prevention", lang: "en", url: "https://www.prevention.com/rss/all.xml/", category: "health" },
  { name: "mindbodygreen", lang: "en", url: "https://www.mindbodygreen.com/rss.xml", category: "health" },
  { name: "Good Housekeeping", lang: "en", url: "https://www.goodhousekeeping.com/rss/all.xml/", category: null },
  { name: "Oprah Daily", lang: "en", url: "https://www.oprahdaily.com/rss/all.xml/", category: null },

  // ---------- Ελληνικά site ----------
  { name: "Harper's Bazaar Greece", lang: "el", url: "https://www.harpersbazaar.gr/feed/", category: null },
  { name: "Marie Claire Greece", lang: "el", url: "https://www.marieclaire.gr/feed/", category: null },
  { name: "InStyle Greece", lang: "el", url: "https://www.instyle.gr/feed/", category: null },
  { name: "Jenny.gr", lang: "el", url: "https://www.jenny.gr/rss", category: null },
  { name: "Woman Idol", lang: "el", url: "https://www.womanidol.com/feed/", category: null },
  { name: "Shape.gr", lang: "el", url: "https://www.shape.gr/feed/", category: "health" },
  { name: "Iatropedia", lang: "el", url: "https://www.iatropedia.gr/feed/", category: "health" },
];
