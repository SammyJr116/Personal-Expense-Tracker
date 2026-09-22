// ACC-09: wraps Google Identity Services (GIS) so sign-in is real only when a
// client ID is configured. Absent a client ID the app stays in simulated mode
// and this module never loads the GIS script (OI-05).
import { GOOGLE_CLIENT_ID } from "./constants";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export function isGoogleConfigured() {
  return typeof GOOGLE_CLIENT_ID === "string" && GOOGLE_CLIENT_ID.length > 0;
}

// GIS is loaded dynamically, so `window.google` is untyped.
function gisId() {
  if (typeof window === "undefined") return null;
  return window.google?.accounts?.id || null;
}

function loadGisScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (gisId()) return Promise.resolve(true);
  if (!document.getElementById("google-gsi")) {
    const s = document.createElement("script");
    s.id = "google-gsi";
    s.src = GIS_SCRIPT_SRC;
    s.async = true;
    document.head.appendChild(s);
  }
  return new Promise((resolve) => {
    let attempts = 0;
    const poll = () => {
      if (gisId()) return resolve(true);
      if (++attempts > 50) return resolve(false);
      setTimeout(poll, 200);
    };
    poll();
  });
}

// Decode the JWT credential payload returned by GIS (name/email/picture).
function decodeJwt(token) {
  try {
    const base = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base));
  } catch {
    return null;
  }
}

// Starts the One Tap / prompt flow. Resolves with the admitted account
// `{ name, email }` or `{ error }` (never domain-enforced here — the page
// owns the COMPANY_DOMAIN check).
export async function promptGoogleSignIn() {
  if (!isGoogleConfigured()) return { error: "UNCONFIGURED" };
  const loaded = await loadGisScript();
  if (!loaded) return { error: "GIS_LOAD_FAILED" };
  return new Promise((resolve) => {
    gisId().initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const profile = decodeJwt(response?.credential);
        if (!profile?.email) return resolve({ error: "NO_PROFILE" });
        resolve({ name: profile.name || profile.email.split("@")[0], email: profile.email });
      },
    });
    try {
      gisId().prompt((notification) => {
        // Do not leave the caller stuck when the prompt is suppressed.
        if (notification && !notification.isDisplayed()) {
          resolve({ error: "PROMPT_UNAVAILABLE" });
        }
      });
    } catch {
      resolve({ error: "PROMPT_FAILED" });
    }
  });
}