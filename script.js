// Development Legacy Group — site behaviour

// TODO: set this to DLG's real enquiries address once confirmed.
const CONTACT_EMAIL = "enquiries@example.com.au";

(function () {
  document.documentElement.classList.remove("no-js");

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  // Header background once the page scrolls
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Skip the menu fade while resizing so it doesn't flash across the breakpoint
  let resizeTimer;
  window.addEventListener("resize", () => {
    document.documentElement.classList.add("is-resizing");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => document.documentElement.classList.remove("is-resizing"), 200);
  });

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-visible"));
  }

  // Footer year and email
  document.getElementById("year").textContent = new Date().getFullYear();
  document.querySelectorAll(".js-email").forEach((a) => {
    a.href = "mailto:" + CONTACT_EMAIL;
    a.textContent = CONTACT_EMAIL;
  });

  // Contact form: validates, then opens the visitor's mail client.
  // Swap this for a form service (e.g. Formspree) or a backend endpoint when ready.
  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const ok = input.value.trim() !== "" && input.checkValidity();
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = "Please complete your name, a valid email and a message.";
      status.classList.add("is-error");
      return;
    }

    const data = new FormData(form);
    const subject = `Website enquiry — ${data.get("enquiry")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "—"}`,
      `Enquiry type: ${data.get("enquiry")}`,
      "",
      data.get("message"),
    ].join("\n");

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.classList.remove("is-error");
    status.textContent = "Thank you — your email client should now open with your enquiry.";
  });
})();
