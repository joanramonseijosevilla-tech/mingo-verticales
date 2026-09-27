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
  message: (value) => value.trim().length > 0 || "Describe brevemente el trabajo.",
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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fields = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea')];
  const isFormValid = fields.every((field) => validateField(field));

  if (!isFormValid) {
    if (formStatus) {
      formStatus.textContent = "Revisa los campos marcados antes de enviar.";
      formStatus.style.color = "#b42318";
    }
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const endpoint = form.dataset.endpoint;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Enviar solicitud";

  if (!endpoint) {
    if (formStatus) {
      formStatus.textContent = "No se ha configurado el envío del formulario.";
      formStatus.style.color = "#b42318";
    }
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Enviando…";
  }
  if (formStatus) {
    formStatus.textContent = "Enviando la solicitud…";
    formStatus.style.color = "#176b45";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { "Accept": "application/json" }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false || data.success === "false" || data.error) {
      throw new Error(data.message || data.error || "No se ha podido enviar la solicitud.");
    }

    form.reset();
    fields.forEach((field) => showFieldError(field, ""));

    if (formStatus) {
      formStatus.textContent = "Solicitud enviada correctamente. Gracias por contactar con Mingo Verticales.";
      formStatus.style.color = "#176b45";
    }
    if (submitButton) submitButton.textContent = "Solicitud enviada";
  } catch (error) {
    if (formStatus) {
      formStatus.textContent = "No se ha podido enviar la solicitud. Si es la primera prueba, revisa si FormSubmit ha enviado un correo de confirmación a mingoverticales@gmail.com.";
      formStatus.style.color = "#b42318";
    }
    if (submitButton) submitButton.textContent = originalButtonText;
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});


// V2.3 · Galería ampliable de trabajos, separada por fases
const workLightboxImages = [...document.querySelectorAll(".work-comparison-grid img, .work-gallery-grid img")];

if (workLightboxImages.length) {
  const galleryGroupFor = (image) => {
    if (image.closest('[aria-labelledby="work-before-title"]')) return { id: "before", label: "Antes" };
    if (image.closest('[aria-labelledby="work-process-title"]')) return { id: "process", label: "Intervención" };
    if (image.closest('[aria-labelledby="work-result-title"]')) return { id: "after", label: "Después" };

    const comparisonFigure = image.closest(".work-comparison-grid figure");
    const comparisonLabel = comparisonFigure?.querySelector(".work-comparison-label")?.textContent?.trim().toLowerCase();
    if (comparisonLabel === "antes") return { id: "before", label: "Antes" };
    if (comparisonLabel === "después" || comparisonLabel === "despues") return { id: "after", label: "Después" };

    return { id: "other", label: "Fotografías" };
  };

  const groups = new Map();

  workLightboxImages.forEach((image) => {
    const group = galleryGroupFor(image);
    const src = image.currentSrc || image.src;
    if (!groups.has(group.id)) groups.set(group.id, { label: group.label, images: [] });
    const bucket = groups.get(group.id).images;
    if (!bucket.some((item) => (item.currentSrc || item.src) === src)) bucket.push(image);
    image.dataset.lightboxGroup = group.id;
  });

  const lightbox = document.createElement("div");
  lightbox.className = "work-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Vista ampliada de la fotografía");
  lightbox.innerHTML = `
    <div class="work-lightbox-content">
      <button class="work-lightbox-close" type="button" aria-label="Cerrar imagen ampliada">×</button>
      <button class="work-lightbox-prev" type="button" aria-label="Fotografía anterior">‹</button>
      <div class="work-lightbox-image-wrap"><img src="" alt=""></div>
      <button class="work-lightbox-next" type="button" aria-label="Fotografía siguiente">›</button>
      <p class="work-lightbox-caption"></p>
    </div>`;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".work-lightbox-caption");
  const closeButton = lightbox.querySelector(".work-lightbox-close");
  const previousButton = lightbox.querySelector(".work-lightbox-prev");
  const nextButton = lightbox.querySelector(".work-lightbox-next");
  let currentGroupId = "";
  let currentIndex = 0;
  let previousFocus = null;

  const imageCaption = (image) => image.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || image.alt;

  const currentGroup = () => groups.get(currentGroupId) || { label: "Fotografías", images: [] };

  const showImage = (index) => {
    const group = currentGroup();
    if (!group.images.length) return;
    currentIndex = (index + group.images.length) % group.images.length;
    const source = group.images[currentIndex];
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt || "Fotografía ampliada del trabajo";
    lightboxCaption.textContent = `${group.label} · ${currentIndex + 1} de ${group.images.length} · ${imageCaption(source)}`;
    const hasSeveral = group.images.length > 1;
    previousButton.hidden = !hasSeveral;
    nextButton.hidden = !hasSeveral;
  };

  const openLightbox = (image) => {
    previousFocus = document.activeElement;
    currentGroupId = image.dataset.lightboxGroup || "other";
    const group = currentGroup();
    const src = image.currentSrc || image.src;
    const foundIndex = group.images.findIndex((item) => (item.currentSrc || item.src) === src);
    showImage(foundIndex >= 0 ? foundIndex : 0);
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    previousFocus?.focus?.();
  };

  workLightboxImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Ampliar fotografía: ${imageCaption(image)}`);
    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", () => showImage(currentIndex - 1));
  nextButton.addEventListener("click", () => showImage(currentIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(currentIndex - 1);
    if (event.key === "ArrowRight") showImage(currentIndex + 1);
  });
}
