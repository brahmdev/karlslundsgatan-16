let galleryData = null;
let currentImages = [];
let currentIndex = 0;

/** Desired gallery order (bathroom is a placeholder until photos exist) */
const CATEGORY_ORDER = [
  "hallway",
  "living-room",
  "kitchen",
  "bedroom-1",
  "bedroom-2",
  "bathroom",
  "views",
];

function init() {
  galleryData = window.GALLERY_DATA;
  if (!galleryData) {
    console.error("Gallery data missing — run ./build.sh first");
    return;
  }

  setupHero();
  setupGallery();
  setupLightbox();
  setupNav();
}

function setupHero() {
  const hero = document.querySelector(".hero-bg");
  if (!hero || !galleryData.hero) return;

  hero.src = galleryData.hero;
  if (galleryData.heroAlt) hero.alt = galleryData.heroAlt;
}

function orderedCategories() {
  const byId = Object.fromEntries(
    (galleryData.categories || []).map((c) => [c.id, c])
  );

  return CATEGORY_ORDER.map((id) => {
    if (id === "bathroom" && !byId.bathroom) {
      return {
        id: "bathroom",
        title: "Bathroom",
        description: "Minor bathroom updates completed — photos coming soon",
        images: [],
        comingSoon: true,
      };
    }
    return byId[id];
  }).filter(Boolean);
}

function createTab(cat, isActive) {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = `gallery-tab${isActive ? " active" : ""}${
    cat.comingSoon ? " coming-soon" : ""
  }`;
  tab.textContent = cat.comingSoon ? `${cat.title} · Soon` : cat.title;
  tab.dataset.target = cat.id;
  tab.addEventListener("click", () => switchTab(cat.id));
  return tab;
}

function fillNav(nav, categories, activeId) {
  nav.innerHTML = "";
  categories.forEach((cat) => {
    nav.appendChild(createTab(cat, cat.id === activeId));
  });
}

function setupGallery() {
  const navTop = document.getElementById("gallery-nav");
  const navBottom = document.getElementById("gallery-nav-bottom");
  const panels = document.getElementById("gallery-panels");
  const categories = orderedCategories();
  const activeId = categories[0]?.id;

  panels.innerHTML = "";
  fillNav(navTop, categories, activeId);
  if (navBottom) fillNav(navBottom, categories, activeId);

  categories.forEach((cat, i) => {
    const panel = document.createElement("div");
    panel.className = `gallery-panel${i === 0 ? " active" : ""}`;
    panel.id = `panel-${cat.id}`;

    if (cat.comingSoon || !cat.images?.length) {
      panel.innerHTML = `
        <div class="coming-soon-panel">
          <div class="icon">🚿</div>
          <h3>Bathroom photos coming soon</h3>
          <p>Minor bathroom updates have been completed. Professional photos will be added shortly — call for a private viewing in the meantime.</p>
        </div>`;
    } else {
      const desc = document.createElement("p");
      desc.className = "gallery-panel-desc";
      desc.textContent = cat.description;
      panel.appendChild(desc);

      const grid = document.createElement("div");
      grid.className = "gallery-grid";

      cat.images.forEach((img, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gallery-item";
        btn.setAttribute("aria-label", img.alt);
        const image = document.createElement("img");
        image.src = img.thumb;
        image.alt = img.alt;
        image.loading = "lazy";
        btn.appendChild(image);
        btn.addEventListener("click", () =>
          openLightbox(cat.images.map((x) => x.src), idx)
        );
        grid.appendChild(btn);
      });

      panel.appendChild(grid);
    }

    panels.appendChild(panel);
  });
}

function switchTab(id) {
  document.querySelectorAll(".gallery-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.target === id);
  });
  document.querySelectorAll(".gallery-panel").forEach((p) => {
    p.classList.toggle("active", p.id === `panel-${id}`);
  });

  // Keep the active chip visible in sticky filter rows
  document.querySelectorAll(".gallery-nav").forEach((nav) => {
    const active = nav.querySelector(".gallery-tab.active");
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  });

  // Jump to top of gallery so new room photos are in view
  const gallery = document.getElementById("gallery");
  if (gallery) {
    const headerH =
      document.querySelector(".site-header")?.offsetHeight || 0;
    const stickyH =
      document.querySelector(".gallery-filters-sticky")?.offsetHeight || 0;
    const top =
      gallery.getBoundingClientRect().top +
      window.scrollY -
      headerH -
      stickyH +
      8;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function setupLightbox() {
  const lb = document.getElementById("lightbox");
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  document.getElementById("lb-prev").addEventListener("click", () => navigate(-1));
  document.getElementById("lb-next").addEventListener("click", () => navigate(1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  });
}

function openLightbox(images, index) {
  currentImages = images;
  currentIndex = index;
  updateLightbox();
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
  updateLightbox();
}

function updateLightbox() {
  document.getElementById("lb-image").src = currentImages[currentIndex];
  document.getElementById("lb-counter").textContent =
    `${currentIndex + 1} / ${currentImages.length}`;
}

function setupNav() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

init();
