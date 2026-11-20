// Light/dark theme for the static pages.
//
// Load this as a plain (non-module) script in <head> so data-theme is set
// before first paint. The chosen theme is remembered in localStorage; the
// default is light.
//
// Elements whose look depends on the theme declare both options:
//   <eds-header data-light-variant="inverse" data-dark-variant="strong">
//   <eds-button data-light-intent="secondary" data-dark-intent="secondaryInverse">
(function () {
  var KEY = "neo-viewer-theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function remember(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* ignore */ }
  }

  var ICONS = {
    // shown in light mode: switch to dark
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    // shown in dark mode: switch to light
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
  };

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#07140D" : "#ffffff");

    document.querySelectorAll("[data-light-variant]").forEach(function (el) {
      el.setAttribute("variant", el.getAttribute("data-" + theme + "-variant"));
    });
    document.querySelectorAll("[data-light-intent]").forEach(function (el) {
      el.setAttribute("intent", el.getAttribute("data-" + theme + "-intent"));
    });

    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      var next = theme === "dark" ? "light" : "dark";
      btn.innerHTML = theme === "dark" ? ICONS.sun : ICONS.moon;
      btn.setAttribute("aria-label", "Switch to " + next + " theme");
      btn.setAttribute("title", "Switch to " + next + " theme");
    }
  }

  var theme = stored() === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", theme);

  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector("eds-header");
    if (header) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      btn.setAttribute("slot", "actions");
      btn.addEventListener("click", function () {
        theme = theme === "dark" ? "light" : "dark";
        remember(theme);
        apply(theme);
      });
      header.appendChild(btn);
    }
    apply(theme);
  });
})();
