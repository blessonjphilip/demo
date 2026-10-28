(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const dotsWrap = document.querySelector(".dots");
  const caption = document.querySelector("[data-caption]");
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });

  const dots = [...dotsWrap.querySelectorAll("button")];

  function go(i) {
    slides[index].classList.remove("active");
    index = (i + slides.length) % slides.length;
    slides[index].classList.add("active");
    dots.forEach((d, n) => d.classList.toggle("active", n === index));
    caption.textContent = slides[index].dataset.title || "";
    restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6500);
  }

  document.querySelector("[data-prev]")?.addEventListener("click", () => go(index - 1));
  document.querySelector("[data-next]")?.addEventListener("click", () => go(index + 1));
  go(0);

  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".mobile-panel");
  toggle?.addEventListener("click", () => panel.classList.toggle("open"));
  panel?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => panel.classList.remove("open"))
  );

  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll(".nav a, .mobile-panel a")];
  const onScroll = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach((s) => {
      if (s.offsetTop <= y) current = s.id;
    });
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll("[data-lightbox]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lightboxImg.src = a.getAttribute("href");
      lightbox.classList.add("open");
    });
  });
  lightbox.querySelector("button").addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("open");
  });

  document.querySelectorAll("[data-video]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.video;
      card.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    });
  });

  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:omrajukutty@yahoo.co.in?subject=${encodeURIComponent("WME website enquiry")}&body=${body}`;
    form.querySelector(".form-note").textContent = "Opening your email app to send this message…";
  });

  document.querySelector(".year").textContent = new Date().getFullYear();

  const reveal = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("in"));
  }
})();
