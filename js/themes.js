const THEMES = {
  classic: {
    name: "Classic",
    css: "css/themes/classic.css",
    desc: "Warm cream, sage green & gold",
    swatch: ["#faf8f5", "#3d5a4c", "#b8956a"],
  },
  midnight: {
    name: "Midnight",
    css: "css/themes/midnight.css",
    desc: "Deep navy with cool teal accents",
    swatch: ["#0f1419", "#4ecdc4", "#1a222d"],
  },
  nordic: {
    name: "Nordic",
    css: "css/themes/nordic.css",
    desc: "Pale ice blue & Scandinavian minimal",
    swatch: ["#f4f7f9", "#5b7c99", "#2c3e50"],
  },
  sunset: {
    name: "Sunset",
    css: "css/themes/sunset.css",
    desc: "Terracotta warmth & golden hour tones",
    swatch: ["#fdf6f0", "#c45c3e", "#3d1f2b"],
  },
  editorial: {
    name: "Editorial",
    css: "css/themes/editorial.css",
    desc: "High-contrast black, white & red",
    swatch: ["#ffffff", "#d62828", "#111111"],
  },
  fastighetsbyran: {
    name: "Fastighetsbyrån",
    css: "css/themes/fastighetsbyran.css",
    desc: "Broker listing look — cream, orange & brown",
    swatch: ["#fdf6ee", "#ff5f00", "#512b2b"],
  },
};

function getThemeId() {
  const param = new URLSearchParams(window.location.search).get("theme");
  return THEMES[param] ? param : "classic";
}

function applyTheme(id) {
  const theme = THEMES[id] || THEMES.classic;
  const link = document.getElementById("theme-css");
  if (link) link.href = theme.css;
  document.documentElement.dataset.theme = id;
}

function setupThemeSwitcher() {
  const select = document.getElementById("theme-select");
  if (!select) return;

  Object.entries(THEMES).forEach(([id, theme]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = theme.name;
    select.appendChild(option);
  });

  select.value = getThemeId();
  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (select.value === "classic") url.searchParams.delete("theme");
    else url.searchParams.set("theme", select.value);
    window.location.href = url.toString();
  });
}

(function initTheme() {
  applyTheme(getThemeId());
  document.addEventListener("DOMContentLoaded", setupThemeSwitcher);
})();
