let galleryData = null;
let currentImages = [];
let currentIndex = 0;

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

function setupGallery() {
  const nav = document.getElementById("gallery-nav");
  const panels = document.getElementById("gallery-panels");
  nav.innerHTML = "";
  panels.innerHTML = "";

  galleryData.categories.forEach((cat, i) => {
    const tab = document.createElement("button");
    tab.className = `gallery-tab${i === 0 ? " active" : ""}`;
    tab.textContent = cat.title;
    tab.dataset.target = cat.id;
    tab.addEventListener("click", () => switchTab(cat.id));
    nav.appendChild(tab);

    const panel = document.createElement("div");
    panel.className = `gallery-panel${i === 0 ? " active" : ""}`;
    panel.id = `panel-${cat.id}`;

    const desc = document.createElement("p");
    desc.className = "gallery-panel-desc";
    desc.textContent = cat.description;
    panel.appendChild(desc);

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    cat.images.forEach((img, idx) => {
      const btn = document.createElement("button");
      btn.className = "gallery-item";
      btn.setAttribute("aria-label", img.alt);
      const image = document.createElement("img");
      image.src = img.thumb;
      image.alt = img.alt;
      image.loading = "lazy";
      btn.appendChild(image);
      btn.addEventListener("click", () =>
        openLightbox(cat.images.map((i) => i.src), idx)
      );
      grid.appendChild(btn);
    });

    panel.appendChild(grid);
    panels.appendChild(panel);
  });

  const bathTab = document.createElement("button");
  bathTab.className = "gallery-tab coming-soon";
  bathTab.dataset.target = "bathroom";
  bathTab.textContent = "Bathroom · Coming soon";
  bathTab.addEventListener("click", () => switchTab("bathroom"));
  nav.appendChild(bathTab);

  const bathPanel = document.createElement("div");
  bathPanel.className = "gallery-panel";
  bathPanel.id = "panel-bathroom";
  bathPanel.innerHTML = `
    <div class="coming-soon-panel">
      <div class="icon">🚿</div>
      <h3>Bathroom photos coming soon</h3>
      <p>Minor bathroom updates have been completed. Professional photos will be added shortly — contact us for a private viewing in the meantime.</p>
    </div>`;
  panels.appendChild(bathPanel);
}

function switchTab(id) {
  document.querySelectorAll(".gallery-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.target === id);
  });
  document.querySelectorAll(".gallery-panel").forEach((p) => {
    p.classList.toggle("active", p.id === `panel-${id}`);
  });
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
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}

init();
