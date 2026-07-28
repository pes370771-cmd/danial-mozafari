// Logs one anonymous visit row to Supabase: when, where the visitor came
// from, rough country (from IP, the IP itself isn't stored), and as much
// technical detail about the device/browser as a website is ever able to
// see. No name, no email — that doesn't exist for an anonymous page visit,
// and this file never asks for it, and never could (browsers simply don't
// hand that over to sites).
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
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "other", osVersion = "";
    if (/Windows NT ([\d.]+)/.test(ua)) { os = "Windows"; osVersion = RegExp.$1; }
    else if (/iPhone OS ([\d_]+)/.test(ua)) { os = "iOS"; osVersion = RegExp.$1.replace(/_/g, "."); }
    else if (/iPad.*OS ([\d_]+)/.test(ua)) { os = "iPadOS"; osVersion = RegExp.$1.replace(/_/g, "."); }
    else if (/Android ([\d.]+)/.test(ua)) { os = "Android"; osVersion = RegExp.$1; }
    else if (ua.includes("Mac OS X")) { os = "macOS"; const m = ua.match(/Mac OS X ([\d_]+)/); osVersion = m ? m[1].replace(/_/g, ".") : ""; }
    else if (ua.includes("Linux")) { os = "Linux"; }

    return { type: isMobile ? "mobile" : "desktop", browser, os, osVersion };
  }

  // On Chromium-based browsers (Chrome/Edge on Android), the site can ask
  // for the exact device model via User-Agent Client Hints. This is the
  // only case where a real model name ("Pixel 8", "SM-A536B", etc.) is
  // ever available — Safari/iOS never expose it, by Apple's design.
  async function detectModel() {
    try {
      if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        const hints = await navigator.userAgentData.getHighEntropyValues(["model", "platformVersion"]);
        return hints.model || null;
      }
    } catch {
      // not supported in this browser — leave blank
    }
    return null;
  }

  async function logVisit() {
    const device = detectDevice();
    const model = await detectModel();

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
      referrer_raw: document.referrer || null,
      country: country,
      device: device.type,
      device_model: model,
      os: device.os,
      os_version: device.osVersion,
      browser: device.browser,
      screen_res: window.screen.width + "x" + window.screen.height,
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      page: window.location.pathname
    });
  }

  logVisit();
})();
