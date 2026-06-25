document.addEventListener("DOMContentLoaded", () => {

/* ── HELPERS ──────────────────────────────────────────── */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const debounce = (fn, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ── ELEMENTS ─────────────────────────────────────────── */
const navbar      = $("#navbar");
const themeBtn    = $("#themeBtn");
const hamburger   = $("#hamburger");
const navLinks    = $("#navLinks");
const scrollTopBtn = $("#scrollTop");

/* ── THEME ────────────────────────────────────────────── */
const applyTheme = dark => {
  document.body.classList.toggle("dark", dark);
  themeBtn.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem("theme", dark ? "dark" : "light");
};

applyTheme(localStorage.getItem("theme") === "dark");
themeBtn?.addEventListener("click", () => applyTheme(!document.body.classList.contains("dark")));

/* ── HAMBURGER ────────────────────────────────────────── */
hamburger?.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
$$(".nav-link").forEach(a => a.addEventListener("click", () => {
  hamburger.classList.remove("open");
  navLinks.classList.remove("open");
}));

/* ── STICKY NAVBAR ────────────────────────────────────── */
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
  scrollTopBtn.classList.toggle("show", window.scrollY > 400);
}, { passive: true });

scrollTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ── SCROLLSPY ────────────────────────────────────────── */
const sections = $$("section[id]");
const links    = $$(".nav-link");

const spy = () => {
  let current = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${current}`));
};
window.addEventListener("scroll", spy, { passive: true });

/* ── TYPING EFFECT ────────────────────────────────────── */
const roles = ["Frontend Developer", "React Developer", "JavaScript Developer", "UI/UX Enthusiast", "Web Designer"];
let rIdx = 0, cIdx = 0, deleting = false;
const typEl = $("#typingText");

const type = () => {
  if (!typEl) return;
  const cur = roles[rIdx];
  typEl.textContent = cur.substring(0, deleting ? --cIdx : ++cIdx);
  if (!deleting && cIdx === cur.length) { deleting = true; return setTimeout(type, 1400); }
  if (deleting && cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
  setTimeout(type, deleting ? 45 : 85);
};
type();

/* ── COUNTERS ─────────────────────────────────────────── */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target;
    let n = 0; const step = target / 55;
    const run = () => { n += step; el.textContent = n < target ? Math.ceil(n) + "+" : target + "+"; if (n < target) requestAnimationFrame(run); };
    run();
    counterObs.unobserve(el);
  });
});
$$(".counter").forEach(el => counterObs.observe(el));

/* ── SKILL BARS ───────────────────────────────────────── */
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const fill = e.target;
    setTimeout(() => { fill.style.width = fill.dataset.width; }, 200);
    skillObs.unobserve(fill);
  });
});
$$(".progress-fill").forEach(el => skillObs.observe(el));

/* ── PROJECT SEARCH ───────────────────────────────────── */
const searchInput = $("#projectSearch");
const projectCards = $$(".project-card");
let activeFilter = "all";

const applyFilters = () => {
  const q = (searchInput?.value || "").toLowerCase().trim();
  projectCards.forEach(c => {
    const matchesFilter = activeFilter === "all" || c.dataset.category === activeFilter;
    const matchesSearch = !q || c.textContent.toLowerCase().includes(q);
    c.style.display = (matchesFilter && matchesSearch) ? "" : "none";
  });
};

const doSearch = debounce(() => applyFilters());
searchInput?.addEventListener("input", doSearch);

/* ── PROJECT FILTERS ──────────────────────────────────── */
$$(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

/* ── FOCUS TRAP HELPER ────────────────────────────────── */
let lastFocused = null;

const trapFocus = (container, e) => {
  const focusables = $$('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])', container);
  if (!focusables.length) return;
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (e.key !== "Tab") return;
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
};

/* ── PROJECT DETAILS MODAL ────────────────────────────── */
const modalOverlay = $("#modalOverlay");
const modalBox = $("#modalBox");

const openProjectModal = card => {
  lastFocused = document.activeElement;

  $("#modalCategory").textContent = card.dataset.type;
  $("#modalTitle").textContent = card.dataset.title;
  $("#modalDesc").textContent = card.dataset.desc;

  const img1 = $("#modalImg1"), img2 = $("#modalImg2");
  img1.src = card.dataset.img1; img1.alt = card.dataset.title + " screenshot one";
  img2.src = card.dataset.img2; img2.alt = card.dataset.title + " screenshot two";

  const techWrap = $("#modalTech");
  techWrap.innerHTML = "";
  card.dataset.tech.split(",").forEach(t => {
    const span = document.createElement("span");
    span.textContent = t.trim();
    techWrap.appendChild(span);
  });

  $("#modalLink").href = card.dataset.link || "#";
  $("#modalRepo").href = card.dataset.repo || "#";

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  modalBox.focus();
};

const closeProjectModal = () => {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
  lastFocused?.focus();
};

$$(".project-open").forEach(btn => {
  btn.addEventListener("click", () => openProjectModal(btn.closest(".project-card")));
});

$("#modalClose")?.addEventListener("click", closeProjectModal);
modalOverlay?.addEventListener("click", e => { if (e.target === modalOverlay) closeProjectModal(); });
modalBox?.addEventListener("keydown", e => {
  if (e.key === "Escape") closeProjectModal();
  trapFocus(modalBox, e);
});

/* ── ARTICLES DATA + MODAL ────────────────────────────── */
const articles = {
  grid: {
    tag: "Frontend",
    title: "Mastering CSS Grid: A Practical Guide",
    date: "June 12, 2026",
    body: `<p>CSS Grid replaced years of float and flexbox workarounds with a layout system built specifically for two-dimensional design. Once you stop reaching for flexbox by default and start thinking in rows and columns, entire categories of layout bugs disappear.</p>
           <p>The biggest shift is naming your grid areas. Instead of nesting wrapper divs to position a sidebar, header, and footer, you describe the layout once in <code>grid-template-areas</code> and assign each child element to a named region. The markup stays flat and the CSS reads like a floor plan.</p>
           <p>Responsive grids get simpler too. <code>repeat(auto-fit, minmax(240px, 1fr))</code> lets the browser decide how many columns fit, removing the need for a stack of breakpoint-specific media queries just to reflow a card grid.</p>
           <p>Start small: rebuild one component, like a card grid or a dashboard layout, using Grid instead of Flexbox, and you'll quickly see where each tool actually belongs.</p>`
  },
  a11y: {
    tag: "Accessibility",
    title: "Why Accessibility Isn't Optional",
    date: "May 28, 2026",
    body: `<p>Accessibility is often treated as a final pass before launch, but the interfaces that work best for assistive technology are usually the ones that were planned with structure in mind from the start.</p>
           <p>Semantic HTML does most of the heavy lifting for free. A <code>&lt;button&gt;</code> is keyboard-operable and announced correctly by screen readers without a single line of JavaScript; a styled <code>&lt;div&gt;</code> pretending to be a button needs ARIA roles, tabindex, and manual key handling just to catch up.</p>
           <p>Keyboard navigation is the fastest way to audit your own work. Unplug the mouse and tab through a page — every interactive element should be reachable, every focus state should be visible, and every modal should trap focus until it's closed.</p>
           <p>Color contrast matters just as much as markup. Text needs at least a 4.5:1 contrast ratio against its background to be legible for users with low vision, and that single rule quietly improves readability for everyone, in every lighting condition.</p>`
  },
  perf: {
    tag: "Performance",
    title: "Speeding Up Your React App",
    date: "May 9, 2026",
    body: `<p>Performance work pays off disproportionately at the start of a user's session, because first paint and time-to-interactive shape their entire impression of the app.</p>
           <p>Code splitting was the single biggest win in my own project. Routes that aren't visited on the first load, like a settings or admin panel, don't need to ship in the initial bundle. Lazy-loading them with dynamic imports cut the main bundle by more than half.</p>
           <p>Images came next. Serving properly sized, modern-format images with native <code>loading="lazy"</code> meant the browser stopped downloading content the user hadn't scrolled to yet.</p>
           <p>Finally, memoisation: wrapping expensive list renders in <code>useMemo</code> and pure components in <code>React.memo</code> stopped unrelated state updates from re-rendering parts of the tree that hadn't actually changed. Together, these three changes took the app from a 4 second first paint to under 1 second.</p>`
  }
};

const articleOverlay = $("#articleOverlay");
const articleBox = $("#articleBox");

const openArticle = key => {
  const a = articles[key];
  if (!a) return;
  lastFocused = document.activeElement;
  $("#articleModalTag").textContent = a.tag;
  $("#articleModalTitle").textContent = a.title;
  $("#articleModalDate").innerHTML = `<i class="fas fa-calendar-days" aria-hidden="true"></i> ${a.date}`;
  $("#articleModalBody").innerHTML = a.body;
  articleOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  articleBox.focus();
};

const closeArticle = () => {
  articleOverlay.classList.remove("open");
  document.body.style.overflow = "";
  lastFocused?.focus();
};

$$(".read-more").forEach(btn => btn.addEventListener("click", () => openArticle(btn.dataset.article)));
$("#articleClose")?.addEventListener("click", closeArticle);
articleOverlay?.addEventListener("click", e => { if (e.target === articleOverlay) closeArticle(); });
articleBox?.addEventListener("keydown", e => {
  if (e.key === "Escape") closeArticle();
  trapFocus(articleBox, e);
});

/* ── CONTACT FORM VALIDATION ──────────────────────────── */
const contactForm = $("#contactForm");
const formSuccess = $("#formSuccess");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  fname:    v => v.trim().length >= 2,
  femail:   v => emailPattern.test(v.trim()),
  fsubject: v => v.trim().length >= 3,
  fmessage: v => v.trim().length >= 10
};

const validateField = id => {
  const input = $("#" + id);
  const group = $("#" + id + "Group");
  const valid = validators[id](input.value);
  group.classList.toggle("error", !valid);
  input.setAttribute("aria-invalid", String(!valid));
  return valid;
};

Object.keys(validators).forEach(id => {
  const input = $("#" + id);
  input?.addEventListener("blur", () => validateField(id));
  input?.addEventListener("input", () => {
    if ($("#" + id + "Group").classList.contains("error")) validateField(id);
  });
});

contactForm?.addEventListener("submit", e => {
  e.preventDefault();
  formSuccess.classList.remove("show");

  const results = Object.keys(validators).map(validateField);
  const allValid = results.every(Boolean);

  if (!allValid) {
    const firstError = $(".form-group.error input, .form-group.error textarea");
    firstError?.focus();
    return;
  }

  const btn = $("#submitBtn");
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';

  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    contactForm.reset();
    Object.keys(validators).forEach(id => $("#" + id + "Group").classList.remove("error"));
    formSuccess.classList.add("show");
    formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 900);
});

/* ── AOS ──────────────────────────────────────────────── */
if (typeof AOS !== "undefined") {
  AOS.init({ duration: 850, once: true, easing: "ease-out" });
}

/* ── SMOOTH SCROLL ────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const hash = a.getAttribute("href");
    if (hash === "#" || hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

});