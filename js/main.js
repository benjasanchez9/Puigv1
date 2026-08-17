/* =========================================================
   PUIG & ASOCIADOS — main.js
   Menú mobile · navegación activa · acordeones · formulario
   · animaciones de entrada · año dinámico
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año dinámico ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header con scroll ---------- */
  var header = document.getElementById("site-header");
  var waFloat = document.querySelector(".wa-float");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (waFloat) waFloat.classList.toggle("is-visible", window.scrollY > 320);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menú mobile ---------- */
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");

  function openMenu() {
    if (!menu || !toggle) return;
    menu.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
  }

  function closeMenu(focusToggle) {
    if (!menu || !toggle) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
    if (focusToggle) toggle.focus();
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") {
        closeMenu(false);
      } else {
        openMenu();
        var first = menu.querySelector("a");
        if (first) first.focus();
      }
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    // Trampa de foco simple dentro del menú abierto
    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = menu.querySelectorAll("a, button");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024) closeMenu(false);
    });
  }

  /* ---------- Navegación activa (one-page) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link[data-nav]"));
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute("data-nav")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var currentId = null, best = 0;
      sections.forEach(function (section) {
        var ratio = visible[section.id] || 0;
        if (ratio > best) { best = ratio; currentId = section.id; }
      });
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-nav") === currentId);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Acordeones de servicios ---------- */
  document.querySelectorAll(".service-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      button.querySelector(".service-toggle-label").textContent = expanded ? "Ver detalle" : "Ocultar detalle";
    });
  });

  /* ---------- Animaciones de entrada ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Formulario ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var submit = document.getElementById("form-submit");

  function showError(field, show) {
    var msg = form.querySelector('[data-error-for="' + field.name + '"]');
    if (msg) msg.hidden = !show;
    field.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function validateField(field) {
    var value = (field.value || "").trim();
    var ok = true;
    if (field.hasAttribute("required") && value === "") ok = false;
    if (ok && field.type === "email" && value !== "") ok = validEmail(value);
    if (ok && field.name === "unidades" && value !== "") {
      var n = Number(value);
      ok = !isNaN(n) && n >= 1 && n <= 9999;
    }
    if (ok && field.maxLength > 0 && value.length > field.maxLength) ok = false;
    showError(field, !ok);
    return ok;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"))
    .filter(function (f) { return f.name !== "sitio"; });

  fields.forEach(function (field) {
    field.addEventListener("blur", function () { validateField(field); });
    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      status.textContent = "Revisá los campos marcados antes de enviar.";
      status.className = "form-status is-error";
      firstInvalid.focus();
      return;
    }

    status.textContent = "Enviando consulta…";
    status.className = "form-status";
    submit.disabled = true;

    fetch(form.action, { method: "POST", body: new FormData(form), headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(function (response) { return response.json().catch(function () { return { ok: response.ok }; }); })
      .then(function (data) {
        if (data && data.ok) {
          status.textContent = "Gracias. Recibimos tu consulta y nos comunicaremos contigo.";
          status.className = "form-status is-ok";
          form.reset();
        } else {
          throw new Error((data && data.error) || "error");
        }
      })
      .catch(function () {
        status.textContent = "No pudimos enviar tu consulta. Podés comunicarte directamente por WhatsApp o email.";
        status.className = "form-status is-error";
      })
      .then(function () { submit.disabled = false; });
  });
})();
