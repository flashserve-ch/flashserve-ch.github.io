/* FlashServe — small, dependency-free enhancements.
   The site works fully without this file; it only adds polish.
   (c) 2026 FlashServe. Tous droits réservés / All rights reserved.
   Propriété de FlashServe et de son CFO, Idriss Yahi.
   Property of FlashServe and its CFO, Idriss Yahi. */
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

  /* 5. Countdown to the pilot launch (January 1, 2027, Geneva time) */
  var countdown = document.querySelector(".countdown");
  if (countdown) {
    var target = new Date(countdown.dataset.target).getTime();
    var nums = {};
    countdown.querySelectorAll("[data-cd]").forEach(function (el) { nums[el.dataset.cd] = el; });
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    var setUnit = function (key, n, padded) {
      var el = nums[key];
      if (!el) return;
      el.textContent = padded ? pad(n) : String(n);
      var name = el.nextElementSibling;
      if (name) name.textContent = n === 1 ? name.dataset.one : name.dataset.other;
    };
    var tick = function () {
      var left = Math.max(0, target - Date.now());
      if (left === 0) {
        countdown.classList.add("is-done");
        var label = countdown.querySelector(".countdown-label");
        if (label) label.lastChild.textContent = countdown.dataset.done;
        return false;
      }
      var s = Math.floor(left / 1000);
      setUnit("days", Math.floor(s / 86400), false);
      setUnit("hours", Math.floor((s % 86400) / 3600), true);
      setUnit("minutes", Math.floor((s % 3600) / 60), true);
      setUnit("seconds", s % 60, true);
      return true;
    };
    if (tick()) {
      var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
    }
  }

  /* 5a. Statistics: numbers count up once, when they come into view */
  var statsBox = document.querySelector("[data-stats]");
  if (statsBox && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var nums = statsBox.querySelectorAll("[data-count]");
    var countUp = function () {
      nums.forEach(function (el) {
        var match = /^(\D*?)(\d+)$/.exec(el.dataset.count);
        if (!match) return;
        var prefix = match[1], end = parseInt(match[2], 10), start = null;
        var step = function (now) {
          if (start === null) start = now;
          var t = Math.min(1, (now - start) / 1100);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = prefix + Math.round(end * eased);
          if (t < 1) window.requestAnimationFrame(step);
        };
        el.textContent = prefix + "0";
        window.requestAnimationFrame(step);
      });
    };
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { statsObserver.disconnect(); countUp(); }
    }, { threshold: 0.35 });
    statsObserver.observe(statsBox);
  }

  /* 5b. Hero spot: pause / play button, and no animation work while it is off screen */
  var spot = document.querySelector(".spot");
  var spotToggle = document.querySelector(".spot-toggle");
  var motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (spot && spotToggle && motionOK) {
    spotToggle.hidden = false;
    spotToggle.addEventListener("click", function () {
      var paused = spot.classList.toggle("is-paused");
      spotToggle.setAttribute("aria-pressed", paused ? "true" : "false");
      spotToggle.setAttribute("aria-label", paused ? spotToggle.dataset.labelPlay : spotToggle.dataset.labelPause);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        spot.classList.toggle("is-offscreen", !entries[0].isIntersecting);
      }).observe(spot);
    }
  }

  /* 6. "No commission" band: pause / play button (moving text must be stoppable) */
  var marquee = document.querySelector("[data-marquee]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (marquee && !reduceMotion.matches) {
    var toggle = marquee.querySelector(".marquee-toggle");
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener("click", function () {
        var paused = marquee.classList.toggle("is-paused");
        toggle.setAttribute("aria-pressed", paused ? "true" : "false");
        toggle.setAttribute("aria-label", paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause);
      });
    }
  }

  /* 7. Phone-only experience: story video, swipe carousel, roadmap fill, sticky booking bar */
  var phone = window.matchMedia("(max-width: 47.99rem) and (pointer: coarse)");
  if (phone.matches) {
    // 7a. Story video: loaded only on phones, plays while visible
    var story = document.querySelector(".story");
    var video = story && story.querySelector("video");
    var saveData = navigator.connection && navigator.connection.saveData;
    if (story && video) {
      if (reduceMotion.matches || saveData || !("IntersectionObserver" in window)) {
        story.classList.add("is-off");
      } else {
        video.poster = video.dataset.poster;
        [["mp4", "video/mp4"], ["webm", "video/webm"]].forEach(function (pair) {
          var source = document.createElement("source");
          source.src = video.dataset[pair[0]];
          source.type = pair[1];
          video.appendChild(source);
        });
        video.load();
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var playing = video.play();
              if (playing && playing.catch) playing.catch(function () {});
            } else {
              video.pause();
            }
          });
        }, { threshold: 0.35 }).observe(video);
      }
    }

    // 7b. Problems carousel: dots follow the swipe
    var track = document.querySelector(".problems");
    var dots = document.querySelectorAll(".carousel-dots i");
    if (track && dots.length) {
      track.setAttribute("tabindex", "0");
      track.setAttribute("aria-label", track.dataset.label);
      var syncDots = function () {
        var max = track.scrollWidth - track.clientWidth;
        var index = max > 0 ? Math.round((track.scrollLeft / max) * (dots.length - 1)) : 0;
        dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === index); });
      };
      track.addEventListener("scroll", syncDots, { passive: true });
      syncDots();
    }

    // 7c. Roadmap: the line fills in as the visitor scrolls
    var timeline = document.querySelector(".timeline");
    if (timeline && !reduceMotion.matches) {
      timeline.classList.add("js-progress");
      var milestones = timeline.querySelectorAll(".milestone");
      var ticking = false;
      var fill = function () {
        ticking = false;
        var box = timeline.getBoundingClientRect();
        var mark = window.innerHeight * 0.62;
        var progress = Math.max(0, Math.min(1, (mark - box.top) / box.height));
        timeline.style.setProperty("--progress", progress.toFixed(3));
        milestones.forEach(function (m) {
          m.classList.toggle("is-reached", m.getBoundingClientRect().top + 12 < mark);
        });
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(fill); }
      }, { passive: true });
      fill();
    }

    // 7d. Sticky booking bar: appears once the hero buttons are scrolled past, hides at Contact
    var bar = document.querySelector("[data-mobile-cta]");
    var heroActions = document.querySelector(".hero");
    var contactSection = document.getElementById("contact");
    if (bar && heroActions && "IntersectionObserver" in window) {
      var pastHero = false;
      var atContact = false;
      var updateBar = function () { bar.classList.toggle("is-visible", pastHero && !atContact); };
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        updateBar();
      }).observe(heroActions);
      if (contactSection) {
        new IntersectionObserver(function (entries) {
          atContact = entries[0].isIntersecting;
          updateBar();
        }, { threshold: 0.15 }).observe(contactSection);
      }
    }
  }

  /* 8. Free pre-booking: opens the form dialog and emails the booking to FlashServe.
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
