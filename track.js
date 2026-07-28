// Logs one anonymous visit row to Supabase: when, where the visitor came
// from, rough country (from IP, the IP itself isn't stored), and
// device/browser type. No name, no email — that doesn't exist for an
// anonymous page visit, and this file never asks for it.
(function () {
  if (typeof window.supabase === "undefined" || SUPABASE_URL.startsWith("PASTE")) {
    return; // Supabase not configured yet — skip silently, don't break the page.
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function detectSource() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("src")) return params.get("src");
    const ref = document.referrer;
    if (!ref) return "direct";
    if (ref.includes("t.me") || ref.includes("telegram")) return "telegram";
    if (ref.includes("instagram")) return "instagram";
    if (ref.includes("linkedin")) return "linkedin";
    if (ref.includes("github")) return "github";
    if (ref.includes("google")) return "google_search";
    try {
      return new URL(ref).hostname;
    } catch {
      return "other";
    }
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    let browser = "other";
    if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    return { type: isMobile ? "mobile" : "desktop", browser };
  }

  async function logVisit() {
    const device = detectDevice();
    let country = "unknown";
    try {
      const res = await fetch("https://ipapi.co/json/");
      const geo = await res.json();
      country = geo.country_name || "unknown";
    } catch {
      // geolocation lookup failed — still log the visit without it
    }

    await client.from("visits").insert({
      source: detectSource(),
      country: country,
      device: device.type,
      browser: device.browser,
      page: window.location.pathname
    });
  }

  logVisit();
})();
