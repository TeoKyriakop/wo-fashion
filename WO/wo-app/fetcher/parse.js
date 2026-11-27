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
    return {
      feed,
      id: hashKey(link),
      title: clean(tag(b, "title")),
      link,
      tags: [...b.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)].map((m) => clean(m[1])),
      text: text.slice(0, 1500),
      excerpt: shorten(text, excerptLen),
      image:
        attr(b, "media:content", "url") || attr(b, "media:thumbnail", "url") || imageEnclosure(b) ||
        firstImg(content) || firstImg(desc) || null,
      date: isNaN(date) ? Date.now() : Math.min(date, Date.now()),
    };
  });
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
export function decode(s) {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
}
function clean(s) {
  return decode(decode(s || "").replace(/<[^>]+>/g, " ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function hashKey(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36) + s.length.toString(36);
}
