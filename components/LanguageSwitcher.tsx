"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, ChevronDown, Check, Search, X } from "lucide-react";

/**
 * Site-wide language switcher backed by Google Website Translator.
 *
 * We don't use Google's default widget UI — it's ugly and clashes with the
 * gold/navy brand. Instead:
 *   1. We load Google's translate_a/element.js once, offscreen.
 *   2. Render our own styled dropdown in the bottom-left corner.
 *   3. When the user picks a language we set the `googtrans` cookie Google's
 *      engine reads (format: `/<source>/<target>`) and reload. Google's
 *      element picks up the cookie on next page-load and re-translates.
 *
 * Why cookie + reload instead of programmatic .goog-te-combo selection?
 * React re-renders disturb Google's DOM patching and you get flicker +
 * partially-untranslated content. Cookie+reload is the official, reliable path.
 *
 * The widget is hidden on localhost previews (translate.google.com blocks
 * dev domains from time to time and the script never calls back). In prod it
 * lives next to the Tawk chat bubble without overlapping: Tawk is bottom-right,
 * this is bottom-left.
 */

// Every language Google Translate supports. Each entry carries the endonym
// (how speakers write the language in itself) AND the English exonym, so
// users can find their language either way — typing "german" or "deutsch"
// both match.
//
// `starred: true` marks the most-spoken languages we float to the top of
// the list when no search filter is active.
type Language = { code: string; label: string; english: string; starred?: boolean };

const LANGUAGES: Language[] = [
  { code: "en",     label: "English",           english: "English",           starred: true },
  { code: "es",     label: "Español",           english: "Spanish",           starred: true },
  { code: "fr",     label: "Français",          english: "French",            starred: true },
  { code: "de",     label: "Deutsch",           english: "German",            starred: true },
  { code: "pt",     label: "Português",         english: "Portuguese",        starred: true },
  { code: "it",     label: "Italiano",          english: "Italian",           starred: true },
  { code: "nl",     label: "Nederlands",        english: "Dutch",             starred: true },
  { code: "ru",     label: "Русский",           english: "Russian",           starred: true },
  { code: "zh-CN",  label: "中文 (简体)",        english: "Chinese (Simplified)", starred: true },
  { code: "zh-TW",  label: "中文 (繁體)",        english: "Chinese (Traditional)" },
  { code: "ja",     label: "日本語",             english: "Japanese",          starred: true },
  { code: "ko",     label: "한국어",             english: "Korean",            starred: true },
  { code: "ar",     label: "العربية",           english: "Arabic",            starred: true },
  { code: "hi",     label: "हिन्दी",             english: "Hindi",             starred: true },
  { code: "bn",     label: "বাংলা",              english: "Bengali",           starred: true },
  { code: "tr",     label: "Türkçe",            english: "Turkish" },
  { code: "pl",     label: "Polski",            english: "Polish" },
  { code: "vi",     label: "Tiếng Việt",        english: "Vietnamese" },
  { code: "th",     label: "ไทย",                english: "Thai" },
  { code: "id",     label: "Bahasa Indonesia",  english: "Indonesian" },
  { code: "ms",     label: "Bahasa Melayu",     english: "Malay" },
  { code: "fil",    label: "Filipino",          english: "Filipino" },
  { code: "sw",     label: "Kiswahili",         english: "Swahili" },
  { code: "am",     label: "አማርኛ",               english: "Amharic" },
  { code: "af",     label: "Afrikaans",         english: "Afrikaans" },
  { code: "sq",     label: "Shqip",             english: "Albanian" },
  { code: "hy",     label: "Հայերեն",           english: "Armenian" },
  { code: "as",     label: "অসমীয়া",             english: "Assamese" },
  { code: "ay",     label: "Aymar",             english: "Aymara" },
  { code: "az",     label: "Azərbaycan",        english: "Azerbaijani" },
  { code: "bm",     label: "Bamanankan",        english: "Bambara" },
  { code: "eu",     label: "Euskara",           english: "Basque" },
  { code: "be",     label: "Беларуская",        english: "Belarusian" },
  { code: "bho",    label: "भोजपुरी",            english: "Bhojpuri" },
  { code: "bs",     label: "Bosanski",          english: "Bosnian" },
  { code: "bg",     label: "Български",         english: "Bulgarian" },
  { code: "ca",     label: "Català",            english: "Catalan" },
  { code: "ceb",    label: "Cebuano",           english: "Cebuano" },
  { code: "ny",     label: "Chichewa",          english: "Chichewa" },
  { code: "co",     label: "Corsu",             english: "Corsican" },
  { code: "hr",     label: "Hrvatski",          english: "Croatian" },
  { code: "cs",     label: "Čeština",           english: "Czech" },
  { code: "da",     label: "Dansk",             english: "Danish" },
  { code: "dv",     label: "ދިވެހި",              english: "Dhivehi" },
  { code: "doi",    label: "डोगरी",              english: "Dogri" },
  { code: "eo",     label: "Esperanto",         english: "Esperanto" },
  { code: "et",     label: "Eesti",             english: "Estonian" },
  { code: "ee",     label: "Eʋegbe",            english: "Ewe" },
  { code: "fi",     label: "Suomi",             english: "Finnish" },
  { code: "fy",     label: "Frysk",             english: "Frisian" },
  { code: "gl",     label: "Galego",            english: "Galician" },
  { code: "ka",     label: "ქართული",           english: "Georgian" },
  { code: "el",     label: "Ελληνικά",          english: "Greek" },
  { code: "gn",     label: "Avañe'ẽ",           english: "Guarani" },
  { code: "gu",     label: "ગુજરાતી",            english: "Gujarati" },
  { code: "ht",     label: "Kreyòl ayisyen",    english: "Haitian Creole" },
  { code: "ha",     label: "Hausa",             english: "Hausa" },
  { code: "haw",    label: "ʻŌlelo Hawaiʻi",    english: "Hawaiian" },
  { code: "iw",     label: "עברית",             english: "Hebrew" },
  { code: "hmn",    label: "Hmoob",             english: "Hmong" },
  { code: "hu",     label: "Magyar",            english: "Hungarian" },
  { code: "is",     label: "Íslenska",          english: "Icelandic" },
  { code: "ig",     label: "Igbo",              english: "Igbo" },
  { code: "ilo",    label: "Ilokano",           english: "Ilocano" },
  { code: "ga",     label: "Gaeilge",           english: "Irish" },
  { code: "jw",     label: "Basa Jawa",         english: "Javanese" },
  { code: "kn",     label: "ಕನ್ನಡ",              english: "Kannada" },
  { code: "kk",     label: "Қазақ",             english: "Kazakh" },
  { code: "km",     label: "ខ្មែរ",               english: "Khmer" },
  { code: "rw",     label: "Kinyarwanda",       english: "Kinyarwanda" },
  { code: "gom",    label: "कोंकणी",             english: "Konkani" },
  { code: "kri",    label: "Krio",              english: "Krio" },
  { code: "ku",     label: "Kurdî",             english: "Kurdish (Kurmanji)" },
  { code: "ckb",    label: "کوردی",             english: "Kurdish (Sorani)" },
  { code: "ky",     label: "Кыргызча",          english: "Kyrgyz" },
  { code: "lo",     label: "ລາວ",                english: "Lao" },
  { code: "la",     label: "Latina",            english: "Latin" },
  { code: "lv",     label: "Latviešu",          english: "Latvian" },
  { code: "ln",     label: "Lingála",           english: "Lingala" },
  { code: "lt",     label: "Lietuvių",          english: "Lithuanian" },
  { code: "lg",     label: "Luganda",           english: "Luganda" },
  { code: "lb",     label: "Lëtzebuergesch",    english: "Luxembourgish" },
  { code: "mk",     label: "Македонски",        english: "Macedonian" },
  { code: "mai",    label: "मैथिली",              english: "Maithili" },
  { code: "mg",     label: "Malagasy",          english: "Malagasy" },
  { code: "ml",     label: "മലയാളം",             english: "Malayalam" },
  { code: "mt",     label: "Malti",             english: "Maltese" },
  { code: "mi",     label: "Māori",             english: "Maori" },
  { code: "mr",     label: "मराठी",              english: "Marathi" },
  { code: "mni-Mtei", label: "ꯃꯤꯇꯩ ꯂꯣꯟ",       english: "Meiteilon (Manipuri)" },
  { code: "lus",    label: "Mizo ṭawng",        english: "Mizo" },
  { code: "mn",     label: "Монгол",            english: "Mongolian" },
  { code: "my",     label: "မြန်မာ",               english: "Myanmar (Burmese)" },
  { code: "ne",     label: "नेपाली",             english: "Nepali" },
  { code: "no",     label: "Norsk",             english: "Norwegian" },
  { code: "or",     label: "ଓଡ଼ିଆ",              english: "Odia (Oriya)" },
  { code: "om",     label: "Afaan Oromoo",      english: "Oromo" },
  { code: "ps",     label: "پښتو",              english: "Pashto" },
  { code: "fa",     label: "فارسی",             english: "Persian" },
  { code: "pa",     label: "ਪੰਜਾਬੀ",             english: "Punjabi" },
  { code: "qu",     label: "Runasimi",          english: "Quechua" },
  { code: "ro",     label: "Română",            english: "Romanian" },
  { code: "sm",     label: "Gagana Samoa",      english: "Samoan" },
  { code: "sa",     label: "संस्कृतम्",           english: "Sanskrit" },
  { code: "gd",     label: "Gàidhlig",          english: "Scots Gaelic" },
  { code: "nso",    label: "Sesotho sa Leboa",  english: "Sepedi" },
  { code: "sr",     label: "Српски",            english: "Serbian" },
  { code: "st",     label: "Sesotho",           english: "Sesotho" },
  { code: "sn",     label: "ChiShona",          english: "Shona" },
  { code: "sd",     label: "سنڌي",              english: "Sindhi" },
  { code: "si",     label: "සිංහල",              english: "Sinhala" },
  { code: "sk",     label: "Slovenčina",        english: "Slovak" },
  { code: "sl",     label: "Slovenščina",       english: "Slovenian" },
  { code: "so",     label: "Soomaali",          english: "Somali" },
  { code: "su",     label: "Basa Sunda",        english: "Sundanese" },
  { code: "sv",     label: "Svenska",           english: "Swedish" },
  { code: "tg",     label: "Тоҷикӣ",            english: "Tajik" },
  { code: "ta",     label: "தமிழ்",              english: "Tamil" },
  { code: "tt",     label: "Татарча",           english: "Tatar" },
  { code: "te",     label: "తెలుగు",             english: "Telugu" },
  { code: "ti",     label: "ትግርኛ",               english: "Tigrinya" },
  { code: "ts",     label: "Xitsonga",          english: "Tsonga" },
  { code: "tk",     label: "Türkmen",           english: "Turkmen" },
  { code: "ak",     label: "Twi",               english: "Twi" },
  { code: "uk",     label: "Українська",        english: "Ukrainian" },
  { code: "ur",     label: "اردو",              english: "Urdu" },
  { code: "ug",     label: "ئۇيغۇرچە",          english: "Uyghur" },
  { code: "uz",     label: "Oʻzbek",            english: "Uzbek" },
  { code: "cy",     label: "Cymraeg",           english: "Welsh" },
  { code: "xh",     label: "IsiXhosa",          english: "Xhosa" },
  { code: "yi",     label: "ייִדיש",             english: "Yiddish" },
  { code: "yo",     label: "Yorùbá",            english: "Yoruba" },
  { code: "zu",     label: "IsiZulu",           english: "Zulu" },
];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: {
          new (
            config: {
              pageLanguage: string;
              includedLanguages?: string;
              layout?: number;
              autoDisplay?: boolean;
            },
            containerId: string
          ): unknown;
          InlineLayout: { SIMPLE: number };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function readGoogTransCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("googtrans="));
  if (!match) return "en";
  // Value format: "/<source>/<target>" (leading slash) OR url-encoded equivalent.
  const raw = decodeURIComponent(match.split("=")[1] || "");
  const parts = raw.split("/").filter(Boolean); // ["en", "es"] from "/en/es"
  return parts[1] || "en";
}

function setGoogTransCookie(target: string) {
  // Clearing (going back to English) = delete both host-scoped and
  // domain-scoped cookies. Google's engine checks both.
  if (target === "en") {
    const host = window.location.hostname;
    const apex = host.startsWith("www.") ? host.slice(4) : host;
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; domain=.${apex}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    return;
  }
  const value = `/en/${target}`;
  document.cookie = `googtrans=${value}; path=/`;
  const host = window.location.hostname;
  const apex = host.startsWith("www.") ? host.slice(4) : host;
  // Only set a domain cookie on real public hostnames (not localhost).
  if (apex.includes(".")) {
    document.cookie = `googtrans=${value}; domain=.${apex}; path=/`;
  }
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("en");
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // ── Filtered list. Starred languages bubble to the top when no query. ──
  const visibleLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...LANGUAGES.filter((l) => l.starred),
        ...LANGUAGES.filter((l) => !l.starred).sort((a, b) =>
          a.english.localeCompare(b.english)
        ),
      ];
    }
    return LANGUAGES.filter(
      (l) =>
        l.english.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    ).sort((a, b) => a.english.localeCompare(b.english));
  }, [query]);

  // ── Load Google's translate script once per page lifetime ─────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("google-translate-script")) return;

    // Google will call this as soon as the script loads. It MUST be defined
    // on window BEFORE we append the <script> element.
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.async = true;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  }, []);

  // ── Read current language from the cookie on mount ────────────────
  useEffect(() => {
    setCurrent(readGoogTransCookie());
  }, []);

  // ── Close dropdown on outside click ───────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ── Focus the search input when the dropdown opens, reset it on close ──
  useEffect(() => {
    if (open) {
      // Next tick — the input is only in the tree after the setState render.
      const id = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery("");
  }, [open]);

  const handleSelect = (code: string) => {
    setOpen(false);
    if (code === current) return;
    setCurrent(code);
    setGoogTransCookie(code);
    // Reload so Google's element re-initializes under the new cookie. This is
    // substantially more reliable than trying to trigger translation in place.
    window.location.reload();
  };

  const currentLang =
    LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <>
      {/* Offscreen host for Google's injected element. Must exist in the DOM
          with this exact id when googleTranslateElementInit fires. */}
      <div
        id="google_translate_element"
        aria-hidden="true"
        className="!absolute !-left-[9999px] !top-0 !h-0 !w-0 !overflow-hidden"
      />

      <div
        ref={rootRef}
        // `notranslate` keeps our own UI labels (language names) untouched —
        // we don't want Google translating "Español" into whatever the current
        // target language is.
        className="notranslate fixed bottom-6 left-6 z-[60]"
        translate="no"
      >
        {/* Dropdown panel */}
        {open && (
          <div
            role="listbox"
            className="absolute bottom-full left-0 mb-2 flex w-72 flex-col overflow-hidden rounded-xl border border-gold-500/25 bg-navy-900/95 shadow-2xl backdrop-blur-sm"
            style={{ maxHeight: "min(70vh, 520px)" }}
          >
            {/* Header: title + search */}
            <div className="border-b border-gold-500/10 px-4 pb-3 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gold-500">
                Choose Language · {LANGUAGES.length}
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search language…"
                  aria-label="Search languages"
                  className="w-full rounded-md border border-border-default bg-navy-950/60 py-1.5 pl-8 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/40 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-muted transition-colors hover:bg-gold-500/10 hover:text-gold-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto py-1">
              {visibleLanguages.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-text-muted">
                  No languages match &ldquo;{query}&rdquo;
                </p>
              ) : (
                visibleLanguages.map((lang) => {
                  const active = lang.code === current;
                  return (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={active}
                      onClick={() => handleSelect(lang.code)}
                      className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-gold-500/10 text-gold-400"
                          : "text-text-secondary hover:bg-gold-500/5 hover:text-text-primary"
                      }`}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">
                          {lang.label}
                        </span>
                        {lang.label !== lang.english && (
                          <span className="truncate text-[11px] text-text-muted">
                            {lang.english}
                          </span>
                        )}
                      </span>
                      {active && (
                        <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Change language"
          onClick={() => setOpen((v) => !v)}
          className="group flex items-center gap-2 rounded-full border border-gold-500/30 bg-navy-900/90 px-4 py-2 text-sm text-gold-400 shadow-lg backdrop-blur-sm transition-all hover:border-gold-500/60 hover:bg-navy-800 hover:text-gold-300"
        >
          <Globe className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>{currentLang.label}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </>
  );
}
