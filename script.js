"use strict";

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = [...document.querySelectorAll(".main-nav a")];
const revealElements = document.querySelectorAll(".reveal");
const currentYear = document.querySelector("#current-year");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

const closeMenu = () => {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

const toggleMenu = () => {
  if (!menuToggle || !mainNav) return;
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  mainNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
};

menuToggle?.addEventListener("click", toggleMenu);
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 1020) closeMenu();
});
window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px" });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

if (currentYear) currentYear.textContent = String(new Date().getFullYear());


const validators = {
  name: (value) => value.trim().length >= 2 || "Escribe un nombre válido.",
  phone: (value) => /^[+\d\s()-]{9,20}$/.test(value.trim()) || "Escribe un teléfono válido.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Escribe un correo válido.",
  location: (value) => value.trim().length >= 2 || "Indica la localidad del trabajo.",
  service: (value) => Boolean(value) || "Selecciona un servicio.",
  message: (value) => value.trim().length >= 15 || "Describe el trabajo con un poco más de detalle.",
  privacy: (checked) => checked || "Debes aceptar el tratamiento de los datos."
};

const showFieldError = (field, message) => {
  const errorElement = form?.querySelector(`[data-error-for="${field.name}"]`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorElement) errorElement.textContent = message || "";
};

const validateField = (field) => {
  const validator = validators[field.name];
  if (!validator) return true;
  const result = field.type === "checkbox" ? validator(field.checked) : validator(field.value);
  const isValid = result === true;
  showFieldError(field, isValid ? "" : result);
  return isValid;
};

form?.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
  field.addEventListener("change", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
});

form?.addEventListener("submit", (event) => {
  const fields = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea')];
  const isFormValid = fields.every((field) => validateField(field));

  if (!isFormValid) {
    event.preventDefault();
    if (formStatus) {
      formStatus.textContent = "Revisa los campos marcados antes de enviar.";
      formStatus.style.color = "#b42318";
    }
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando…";
  }
  if (formStatus) {
    formStatus.textContent = "Enviando la solicitud…";
    formStatus.style.color = "#176b45";
  }
});
