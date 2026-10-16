/* FlashServe — small, dependency-free enhancements.
   The site works fully without this file; it only polishes navigation. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menu = document.querySelector(".nav-mobile");

  /* 1. Header gets a subtle border once the page is scrolled */
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2. Mobile menu: close after choosing a link, on Escape, or on outside click */
  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) menu.removeAttribute("open");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.hasAttribute("open")) {
        menu.removeAttribute("open");
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (menu.hasAttribute("open") && !menu.contains(event.target)) menu.removeAttribute("open");
    });
  }

  /* 3. Language switch keeps the visitor on the same section (#pilot, #contact...) */
  document.querySelectorAll("[data-lang-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      var base = link.getAttribute("href").split("#")[0];
      if (window.location.hash) link.setAttribute("href", base + window.location.hash);
    });
  });

  /* 4. Highlight the menu item of the section currently on screen */
  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll(".nav-desktop .nav-link");
    var byId = {};
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      if (id) byId[id] = link;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
          link.classList.add("is-active");
          link.setAttribute("aria-current", "location");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* 5. Free pre-booking: opens the form dialog and emails the booking to FlashServe.
        Without JavaScript the button simply opens a pre-filled email instead. */
  var dialog = document.getElementById("reserve-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var form = dialog.querySelector(".reserve-form");
  var formView = dialog.querySelector('[data-view="form"]');
  var successView = dialog.querySelector('[data-view="success"]');
  var errorBox = dialog.querySelector(".form-error");
  var submitBtn = form.querySelector('button[type="submit"]');
  var ENDPOINT = "https://api.web3forms.com/submit";
  var PLACEHOLDER = "REPLACE_WITH_WEB3FORMS_ACCESS_KEY";

  function showForm() {
    form.reset();
    form.classList.remove("was-validated");
    errorBox.hidden = true;
    formView.hidden = false;
    successView.hidden = true;
    setBusy(false);
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    submitBtn.textContent = busy ? submitBtn.dataset.sending : submitBtn.dataset.label;
  }

  function showSuccess() {
    formView.hidden = true;
    successView.hidden = false;
    var title = successView.querySelector("h2");
    if (title) title.focus();
  }

  // Until the form service key is configured, the button keeps opening a pre-filled email
  var keyField = form.elements.access_key;
  var configured = keyField && keyField.value && keyField.value !== PLACEHOLDER;

  document.querySelectorAll("[data-open-reserve]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (!configured) return;
      event.preventDefault();
      showForm();
      dialog.showModal();
      var first = form.querySelector('input[name="name"]');
      if (first) first.focus();
    });
  });

  dialog.querySelectorAll("[data-close-dialog]").forEach(function (button) {
    button.addEventListener("click", function () { dialog.close(); });
  });
  // Click on the dark backdrop closes the dialog
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  function value(name) {
    var field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Honeypot: real visitors never tick this hidden box
    if (form.elements.botcheck && form.elements.botcheck.checked) { showSuccess(); return; }

    var key = value("access_key");
    if (!key || key === PLACEHOLDER) { errorBox.hidden = false; return; }

    var restaurant = value("restaurant");
    var demand = value("demand");
    var email = value("email");
    var lang = form.dataset.lang === "en" ? "Anglais" : "Français";

    // The email FlashServe receives: the client's request comes first when there is one
    var data = {
      access_key: key,
      subject: "FLASHSERVE Pilote reservation --- " + restaurant + (demand ? " — ★ DEMANDE DU CLIENT" : ""),
      from_name: "Site FlashServe"
    };
    if (demand) data["★ Demande du client"] = demand;
    data["Restaurant"] = restaurant;
    data["Nom et prénom"] = value("name");
    data["Téléphone"] = value("phone");
    data["E-mail"] = email || "non renseigné";
    data["Ville"] = value("city");
    data["Type d'établissement"] = value("venue_type") || "non renseigné";
    data["Offre"] = "Programme Partenaire Pilote 2027 — pré-réservation gratuite (CHF 59.90/mois pendant 1 an dès le 1er janvier 2027)";
    data["Langue du site"] = lang;
    data["Consentement de recontact"] = "Oui";
    if (email) data.replyto = email;

    setBusy(true);
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (json) {
          if (response.ok && json.success) { showSuccess(); }
          else { errorBox.hidden = false; }
        });
      })
      .catch(function () { errorBox.hidden = false; })
      .then(function () { setBusy(false); });
  });
})();
