(() => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroImg = document.querySelector(".hero__media img");
  const hero = document.querySelector(".hero");
  const bible = document.getElementById("heroBible");
  const about = document.getElementById("about");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!reduceMotion && heroImg) {
      const shift = Math.min(y, 420) * 0.16;
      heroImg.style.transform = `translate3d(0, ${shift}px, 0) scale(1.04)`;
    }
    if (bible && about) {
      const range = Math.max(about.offsetTop - Math.min(window.innerHeight, 900) * 0.35, 220);
      let p = Math.min(Math.max(y / range, 0), 1);
      if (reduceMotion) p = y > 80 ? 1 : 0;
      const scale = reduceMotion ? 1 : 1 - 0.6 * p;
      const yMove = reduceMotion ? 0 : y * 0.35;
      const opacity = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3) : 1;
      bible.style.transform = `translate3d(0, ${yMove}px, 0) scale(${scale})`;
      bible.style.opacity = String(opacity);
      bible.style.visibility = opacity < 0.02 ? "hidden" : "visible";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  const markReady = () => document.documentElement.classList.add("is-ready");
  requestAnimationFrame(() => requestAnimationFrame(markReady));

  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.classList.add("is-fade");
    const show = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) show();
    else img.addEventListener("load", show, { once: true });
  });

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".gallery__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".gallery__tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".gallery__panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("is-active");
    });
  });

  const revealEls = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (!reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  const whatsappNumber = "491772476973";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const topic = String(data.get("topic") || "").trim();
    const message = String(data.get("message") || "").trim();
    const text = [
      `Hello, I would like to send a ${topic}.`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message,
    ].join("\n");
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    note.hidden = false;
  });
})();
