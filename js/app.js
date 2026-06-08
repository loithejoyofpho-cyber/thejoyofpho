/* Renders the best sellers, full menu and handles small UI interactions. */

const DISH_PATH = "assets/dishes/";

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function slug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Best sellers ---------- */
function renderBestSellers() {
  const grid = document.getElementById("bestSellerGrid");
  if (!grid || typeof BEST_SELLERS === "undefined") return;

  BEST_SELLERS.forEach((d) => {
    const card = el("article", "dish-card");
    const src = DISH_PATH + encodeURIComponent(d.img);

    card.innerHTML = `
      <div class="dish-photo">
        ${d.tag ? `<span class="dish-tag">${d.tag}</span>` : ""}
        <img src="${src}" alt="${d.name} — ${d.en}" loading="lazy" />
      </div>
      <div class="dish-body">
        <h3 class="dish-name">${d.name}</h3>
        <p class="dish-en">${d.en}</p>
        <p class="dish-desc">${d.desc}</p>
        <div class="dish-foot">
          <span class="dish-code">${d.code}</span>
          <span class="dish-price">${d.price}</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ---------- Full menu (list only, by category) ---------- */
function renderMenu() {
  const catNav = document.getElementById("catNav");
  const list = document.getElementById("menuList");
  if (!list || typeof MENU === "undefined") return;

  MENU.forEach((cat) => {
    const id = "cat-" + slug(cat.vi + "-" + cat.en);

    // category chip
    const chip = el("a", "cat-chip", cat.en);
    chip.href = "#" + id;
    catNav.appendChild(chip);

    // category block
    const block = el("section", "menu-cat");
    block.id = id;

    const head = el("div", "menu-cat-head");
    head.innerHTML = `
      <span class="menu-cat-vi">${cat.vi}</span>
      <span class="menu-cat-en">${cat.en}</span>
      ${cat.note ? `<span class="menu-cat-note">${cat.note}</span>` : ""}`;
    block.appendChild(head);

    const grid = el("div", "item-grid");
    cat.items.forEach((it) => {
      const row = el("div", "menu-item");
      row.innerHTML = `
        <div class="item-main">
          <div class="item-top">
            ${it.code ? `<span class="item-code">${it.code}</span>` : ""}
            <span class="item-name">${it.name}</span>
          </div>
          <span class="item-en">${it.en}</span>
        </div>
        <span class="item-dots"></span>
        <span class="item-price">${it.price}</span>`;
      grid.appendChild(row);
    });
    block.appendChild(grid);
    list.appendChild(block);
  });

  setupScrollSpy();
}

/* ---------- Category nav highlighting ---------- */
function setupScrollSpy() {
  const chips = Array.from(document.querySelectorAll(".cat-chip"));
  const sections = chips
    .map((c) => document.querySelector(c.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          chips.forEach((c) =>
            c.classList.toggle("active", c.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
}

/* ---------- Mobile nav ---------- */
function setupNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---------- Reviews ---------- */
const FEEDBACK_KEY = "joyOfPhoFeedback";

function loadStoredFeedback() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

function starString(rating) {
  const r = Math.round(rating);
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += i <= r ? "\u2605" : '<span class="empty">\u2605</span>';
  }
  return out;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getAllReviews() {
  const seeded = (typeof SAMPLE_REVIEWS !== "undefined" ? SAMPLE_REVIEWS : []).map((r) => ({
    ...r,
    yours: false,
  }));
  const mine = loadStoredFeedback()
    .filter((f) => f && (f.rating || f.message))
    .map((f) => ({
      name: f.name || "Guest",
      rating: f.rating || 0,
      message: f.message || "",
      at: f.at,
      yours: true,
    }));
  // Newest of the user's reviews first, then seeded reviews.
  return [...mine.reverse(), ...seeded];
}

function renderReviews() {
  const grid = document.getElementById("reviewGrid");
  const summary = document.getElementById("feedbackSummary");
  if (!grid) return;

  const reviews = getAllReviews();
  const rated = reviews.filter((r) => r.rating > 0);
  const avg = rated.length
    ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
    : 0;

  if (summary) {
    summary.innerHTML = `
      <div class="summary-score">${avg ? avg.toFixed(1) : "—"}</div>
      <div class="summary-meta">
        <div class="summary-stars">${starString(avg)}</div>
        <div class="summary-count">${reviews.length} review${reviews.length === 1 ? "" : "s"} from our guests</div>
      </div>`;
  }

  grid.innerHTML = "";
  reviews.forEach((r) => {
    const initial = (r.name || "G").trim().charAt(0).toUpperCase() || "G";
    const card = el("article", "review-card" + (r.yours ? " is-yours" : ""));
    card.innerHTML = `
      ${r.yours ? '<span class="review-badge">Your review</span>' : ""}
      <div class="review-head">
        <div class="review-author">
          <span class="review-avatar">${initial}</span>
          <div>
            <div class="review-name">${escapeHtml(r.name || "Guest")}</div>
            <div class="review-date">${formatDate(r.at)}</div>
          </div>
        </div>
        <div class="review-stars">${starString(r.rating)}</div>
      </div>
      ${r.message ? `<p class="review-text">${escapeHtml(r.message)}</p>` : ""}`;
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Feedback modal ---------- */
function setupFeedback() {
  const overlay = document.getElementById("feedbackModal");
  if (!overlay) return;

  const openBtn = document.getElementById("openFeedbackBtn");
  const closeBtn = document.getElementById("feedbackClose");
  const doneBtn = document.getElementById("feedbackDone");
  const form = document.getElementById("feedbackForm");
  const formWrap = document.getElementById("feedbackFormWrap");
  const thanks = document.getElementById("feedbackThanks");
  const stars = Array.from(document.querySelectorAll("#ratingStars .star"));
  const errorEl = document.getElementById("fbError");
  let rating = 0;
  let autoShown = false;

  function open() {
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function paintStars(value) {
    stars.forEach((s) =>
      s.classList.toggle("filled", Number(s.dataset.value) <= value)
    );
  }

  stars.forEach((star) => {
    star.addEventListener("mouseenter", () => paintStars(Number(star.dataset.value)));
    star.addEventListener("mouseleave", () => paintStars(rating));
    star.addEventListener("click", () => {
      rating = Number(star.dataset.value);
      paintStars(rating);
      if (errorEl) errorEl.textContent = "";
    });
  });

  function resetForm() {
    rating = 0;
    paintStars(0);
    if (form) form.reset();
    if (errorEl) errorEl.textContent = "";
    if (formWrap) formWrap.hidden = false;
    if (thanks) thanks.hidden = true;
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      resetForm();
      open();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (doneBtn)
    doneBtn.addEventListener("click", () => {
      close();
      const section = document.getElementById("feedback");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = document.getElementById("fbMessage").value.trim();
      if (rating === 0 && !message) {
        errorEl.textContent = "Please leave a rating or a quick note.";
        return;
      }
      const entry = {
        rating,
        name: document.getElementById("fbName").value.trim(),
        message,
        at: new Date().toISOString(),
      };
      try {
        const all = loadStoredFeedback();
        all.push(entry);
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
      } catch (_) {
        /* storage may be unavailable; still show thanks */
      }
      renderReviews();
      formWrap.hidden = true;
      thanks.hidden = false;
    });
  }

  // Auto-open once when the user reaches the bottom of the page.
  function nearBottom() {
    const scrolled = window.innerHeight + window.scrollY;
    return scrolled >= document.body.offsetHeight - 40;
  }
  function onScroll() {
    if (autoShown) return;
    if (sessionStorage.getItem("joyOfPhoFeedbackShown")) {
      autoShown = true;
      window.removeEventListener("scroll", onScroll);
      return;
    }
    if (nearBottom()) {
      autoShown = true;
      sessionStorage.setItem("joyOfPhoFeedbackShown", "1");
      window.removeEventListener("scroll", onScroll);
      open();
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderBestSellers();
  renderMenu();
  renderReviews();
  setupNav();
  setupFeedback();
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
});
