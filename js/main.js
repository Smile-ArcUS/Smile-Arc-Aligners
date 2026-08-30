/* =========================================================
   SmileArc Aligners — shared site behavior
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- dark / light theme toggle ---------- */
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var prefersDarkMQ = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  function explicitTheme() {
    try { return localStorage.getItem("sa-theme"); } catch (e) { return null; }
  }
  function effectiveTheme() {
    var explicit = explicitTheme();
    if (explicit === "dark" || explicit === "light") return explicit;
    return (prefersDarkMQ && prefersDarkMQ.matches) ? "dark" : "light";
  }
  function applyTheme(theme) {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }
  applyTheme(effectiveTheme());
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      try { localStorage.setItem("sa-theme", next); } catch (e) {}
      document.documentElement.setAttribute("data-theme", next);
      applyTheme(next);
    });
  }
  if (prefersDarkMQ && prefersDarkMQ.addEventListener) {
    prefersDarkMQ.addEventListener("change", function () {
      if (!explicitTheme()) applyTheme(effectiveTheme());
    });
  }

  /* ---------- mobile nav ---------- */
  var hamburger = document.querySelector(".hamburger");
  var mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }

  /* ---------- search overlay ---------- */
  var searchIndex = [
    { title: "How It Works", desc: "From telling us your smile goal to your last aligner tray — the full process.", url: "how-it-works.html" },
    { title: "Pricing & Plans", desc: "Compare SmileArc Complete, SmileArc Lite and monthly payment options.", url: "pricing.html" },
    { title: "About SmileArc", desc: "Our story, our licensed clinical team, and where your aligners are made.", url: "about.html" },
    { title: "Patient Reviews", desc: "Real results and ratings from SmileArc members across the country.", url: "reviews.html" },
    { title: "Contact Us", desc: "Talk to a smile consultant by video, or send us a message.", url: "contact.html" },
    { title: "Tell Us Your Smile Goal", desc: "Answer a couple of quick questions — no video call required. We'll call you with your options.", url: "how-it-works.html#start" },
    { title: "At-Home Impression Kit", desc: "How our precision impression kit works, shipped straight to your door.", url: "how-it-works.html#kit" },
    { title: "Licensed Orthodontists", desc: "Every treatment plan is designed and monitored by a US-licensed orthodontist.", url: "about.html#clinical" },
    { title: "Financing & HSA/FSA", desc: "Monthly payment plans and HSA/FSA-eligible purchases.", url: "pricing.html#financing" },
    { title: "Retainers", desc: "Keep your results with SmileArc custom retainers after treatment.", url: "pricing.html" },
    { title: "FAQs", desc: "Answers about treatment time, pain, eating, and aftercare.", url: "contact.html#faq" },
    { title: "Reserve Your Kit", desc: "A simple 40% deposit reserves your plan and starts your impression kit on its way.", url: "how-it-works.html#deposit" },
    { title: "Video Consultations", desc: "Meet your smile consultant live on Google Meet or Zoom, once your impression kit arrives.", url: "how-it-works.html#video" }
  ];

  var searchOverlay = document.querySelector(".search-overlay");
  var searchInput = document.querySelector(".search-field input");
  var searchResults = document.querySelector(".search-results");
  var searchOpeners = document.querySelectorAll("[data-search-open]");
  var searchClose = document.querySelector(".search-close");

  function renderResults(query) {
    if (!searchResults) return;
    var q = (query || "").trim().toLowerCase();
    var items = !q ? searchIndex : searchIndex.filter(function (i) {
      return (i.title + " " + i.desc).toLowerCase().indexOf(q) !== -1;
    });
    if (items.length === 0) {
      searchResults.innerHTML = '<div class="search-hint">No matches. Try "pricing", "how it works", or "contact".</div>';
      return;
    }
    searchResults.innerHTML = items.map(function (i) {
      return '<a href="' + i.url + '"><span class="sr-title">' + i.title + '</span><span class="sr-desc">' + i.desc + '</span></a>';
    }).join("");
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add("open");
    renderResults("");
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 60);
    document.body.style.overflow = "hidden";
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  searchOpeners.forEach(function (btn) {
    btn.addEventListener("click", openSearch);
  });
  if (searchClose) searchClose.addEventListener("click", closeSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener("click", function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () { renderResults(searchInput.value); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); openSearch(); }
  });

  /* ---------- FAQ accordion ---------- */
  /* max-height is set to each answer's real measured height, not a fixed
     cap, so long answers open fully and the closed state is an exact 0. */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    if (item.classList.contains("open")) a.style.maxHeight = a.scrollHeight + "px";
    q.addEventListener("click", function () {
      var wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item").forEach(function (i) {
        i.classList.remove("open");
        var ia = i.querySelector(".faq-a");
        if (ia) ia.style.maxHeight = "";
      });
      if (!wasOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- contact / assessment form real-submit (FormSubmit.co, no backend needed) ---------- */
  document.querySelectorAll("form[data-real-submit]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.querySelector(".form-success");
      var error = form.querySelector(".form-error");
      var btn = form.querySelector('button[type="submit"]');
      var btnLabel = btn ? btn.textContent : "";
      if (success) success.classList.remove("show");
      if (error) error.classList.remove("show");
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          if (success) {
            success.classList.add("show");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          form.reset();
        })
        .catch(function () {
          // Network/CSP block (e.g. this page running inside a sandboxed preview) —
          // fail gracefully instead of leaving the visitor with no feedback.
          if (error) {
            error.classList.add("show");
            error.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        });
    });
  });

  /* ---------- active nav link highlight ---------- */
  var here = (window.location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (here === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---------- scroll-reveal animation (progressive enhancement) ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    var revealSelector = [
      ".card", ".price-card", ".stat", ".team-card", ".quote-card", ".faq-item"
    ].join(",");
    var revealEls = Array.prototype.filter.call(
      document.querySelectorAll(revealSelector),
      function (el) { return !el.closest(".hero") && !el.closest(".page-hero"); }
    );
    if (revealEls.length && "IntersectionObserver" in window) {
      document.documentElement.classList.add("js-anim");
      revealEls.forEach(function (el, i) {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 3) * 70 + "ms";
      });
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- scroll progress bar ---------- */
  (function () {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var doc = document.scrollingElement || document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.transform = "scaleX(" + (Math.max(0, Math.min(100, pct)) / 100) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ---------- animated count-up numbers (stat strips, rating score) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var countEls = document.querySelectorAll(".stat b, .rs-score b, .rs-score > span");
    function animateCountUp(el) {
      var text = el.textContent;
      var re = /[\d,]+(?:\.\d+)?/g;
      var segments = [];
      var lastIndex = 0, m;
      while ((m = re.exec(text))) {
        if (m.index > lastIndex) segments.push({ type: "text", value: text.slice(lastIndex, m.index) });
        var raw = m[0];
        var decPart = raw.split(".")[1];
        segments.push({
          type: "num",
          target: parseFloat(raw.replace(/,/g, "")),
          decimals: decPart ? decPart.length : 0,
          comma: raw.indexOf(",") !== -1
        });
        lastIndex = re.lastIndex;
      }
      if (lastIndex < text.length) segments.push({ type: "text", value: text.slice(lastIndex) });
      if (!segments.some(function (s) { return s.type === "num"; })) return;

      function fmt(num, seg) {
        var val = seg.decimals ? num.toFixed(seg.decimals) : Math.round(num).toString();
        if (seg.comma) {
          var parts = val.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          val = parts.join(".");
        }
        return val;
      }

      var duration = 1100, start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = segments.map(function (s) {
          return s.type === "num" ? fmt(s.target * eased, s) : s.value;
        }).join("");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (countEls.length) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCountUp(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- animated rating bars (reviews.html) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var bars = document.querySelectorAll(".rb-bar span");
    if (bars.length) {
      bars.forEach(function (bar) {
        bar.dataset.target = bar.style.width;
        bar.style.width = "0%";
        bar.style.transition = "width 900ms cubic-bezier(.16,1,.3,1)";
      });
      var barObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.target;
            barObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      bars.forEach(function (bar) { barObserver.observe(bar); });
    }
  }

  /* ---------- subtle hero image parallax tilt (desktop pointer only) ---------- */
  if (!reduceMotion && window.matchMedia && window.matchMedia("(pointer:fine)").matches) {
    var heroSection = document.querySelector(".hero");
    var heroImg = document.querySelector(".hero-media img");
    if (heroSection && heroImg) {
      heroImg.style.transition = "transform .35s cubic-bezier(.16,1,.3,1)";
      heroImg.style.willChange = "transform";
      var tiltX = 0, tiltY = 0, tiltTicking = false;
      function applyTilt() {
        var rect = heroSection.getBoundingClientRect();
        var px = (tiltX - rect.left) / rect.width - 0.5;
        var py = (tiltY - rect.top) / rect.height - 0.5;
        heroImg.style.transform = "perspective(1000px) rotateY(" + (px * 5).toFixed(2) + "deg) rotateX(" + (-py * 5).toFixed(2) + "deg) scale(1.015)";
        tiltTicking = false;
      }
      heroSection.addEventListener("mousemove", function (e) {
        tiltX = e.clientX; tiltY = e.clientY;
        if (!tiltTicking) { tiltTicking = true; requestAnimationFrame(applyTilt); }
      }, { passive: true });
      heroSection.addEventListener("mouseleave", function () {
        heroImg.style.transform = "";
      });
    }
  }

});
