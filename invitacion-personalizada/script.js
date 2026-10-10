const RSVP_CONFIG = {
  weddingDate: "2026-12-20T15:00:00-06:00",
  tokenParam: "i",
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbzLt7XX8q3hAMgll69_9A62IW1qB5sb86sKdoYy3la2NO7FdRPGQr2jTcnnqcu_lIFN/exec",
};

let currentInvitation = null;
let rsvpSubmitting = false;
let carouselIndex = 0;
let carouselTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 1000,
      delay: 0,
      offset: 0,
      once: false,
      mirror: true,
      anchorPlacement: "top-center",
      easing: "ease-out-cubic"
    });
  }

  setupNavigation();
  setupCountdown();
  setupCarousel();
  setupPersonalizedRsvp();
});

function setupNavigation() {
  const navToggle = document.querySelector("#nav-toggle");
  const navLinks = document.querySelector("#nav-links");

  navToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("active");
    navToggle.classList.toggle("open");
  });

  window.cerrarMenu = () => {
    navLinks?.classList.remove("active");
    navToggle?.classList.remove("open");
  };
}

function toggleMusica() {
  const audio = document.querySelector("#musica");
  const icon = document.querySelector("#music-icon");
  const label = document.querySelector("#music-label");

  if (!audio || !icon || !label) return;

  if (audio.paused) {
    audio
      .play()
      .then(() => {
        icon.textContent = "♬";
        label.textContent = "Pausar musica";
      })
      .catch(() => {
        label.textContent = "No se pudo reproducir la musica";
      });
    return;
  }

  audio.pause();
  icon.textContent = "♪";
  label.textContent = "Reproducir musica";
}

window.toggleMusica = toggleMusica;

function setupCountdown() {
  const countdown = document.querySelector("#countdown");
  if (!countdown) return;

  const update = () => {
    const remaining = new Date(RSVP_CONFIG.weddingDate).getTime() - Date.now();

    if (remaining <= 0) {
      countdown.innerHTML = "<span class='count-today'>Es hoy!</span>";
      return;
    }

    const units = [
      ["days", 1000 * 60 * 60 * 24],
      ["hours", 1000 * 60 * 60],
      ["minutes", 1000 * 60],
      ["seconds", 1000],
    ];

    let rest = remaining;
    units.forEach(([id, duration]) => {
      const value = Math.floor(rest / duration);
      rest -= value * duration;
      const node = document.querySelector(`#${id}`);
      if (node) node.textContent = String(value).padStart(2, "0");
    });
  };

  update();
  window.setInterval(update, 1000);
}

function setupCarousel() {
  const carousel = document.querySelector("#carousel");
  const dots = [...document.querySelectorAll(".dot")];
  const totalSlides = dots.length;

  if (!carousel || !totalSlides) return;

  const goToSlide = (index) => {
    carouselIndex = (index + totalSlides) % totalSlides;
    carousel.style.transform = `translateX(-${carouselIndex * 100}%)`;
    dots.forEach((dot, position) =>
      dot.classList.toggle("active", position === carouselIndex),
    );
  };

  const restartTimer = () => {
    window.clearInterval(carouselTimer);
    carouselTimer = window.setInterval(
      () => goToSlide(carouselIndex + 1),
      4000,
    );
  };

  window.moverCarruselManual = (direction) => {
    goToSlide(carouselIndex + direction);
    restartTimer();
  };

  window.irASlide = (index) => {
    goToSlide(index);
    restartTimer();
  };

  restartTimer();
}

function setupPersonalizedRsvp() {
  const token = new URLSearchParams(window.location.search).get(
    RSVP_CONFIG.tokenParam,
  );
  const loading = document.querySelector("#rsvp-loading");
  const noLink = document.querySelector("#rsvp-no-link");

  if (!token) {
    loading?.classList.add("hidden");
    noLink?.classList.remove("hidden");
    return;
  }

  loadInvitation(token)
    .then((invitation) => {
      loading?.classList.add("hidden");
      renderInvitation(invitation);
      showInvitationEnvelope(invitation);
    })
    .catch(() => {
      loading?.classList.add("hidden");
      noLink?.classList.remove("hidden");
      hideInvitationEnvelope();
      const message = noLink?.querySelector("p");
      if (message)
        message.textContent =
          "No pudimos validar este enlace. Revisa que este completo o intenta nuevamente.";
    });
}

async function loadInvitation(token) {
  const response = await loadJsonp({ action: "invitation", token });
  if (
    !response?.ok ||
    !Array.isArray(response.guests) ||
    !response.guests.length
  ) {
    throw new Error("Invalid invitation");
  }

  currentInvitation = { token, ...response };
  return currentInvitation;
}

function showInvitationEnvelope(invitation) {
  const gate = document.querySelector("#invitation-gate");
  const scene = document.querySelector("#envelope-scene");
  const addressee = document.querySelector("#envelope-addressee");
  const prefix = document.querySelector("#envelope-address-prefix");
  const letter = document.querySelector("#envelope-letter");
  const continueButton = document.querySelector("#envelope-continue");

  if (!gate || !scene || !addressee || !prefix || !continueButton) return;

  const family = invitation.family?.trim().replace(/^familia\s+/i, "");
  prefix.textContent = family ? "Para la familia" : "Para";
  addressee.textContent = family || "nuestros invitados";
  gate.setAttribute("aria-hidden", "false");
  gate.classList.add("is-ready");
  scene.disabled = false;

  scene.addEventListener(
    "click",
    () => {
      scene.disabled = true;
      scene.setAttribute("aria-expanded", "true");
      gate.classList.add("is-opening");

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.setTimeout(() => {
        letter?.setAttribute("aria-hidden", "false");
        gate.classList.add("is-open");
        continueButton.disabled = false;
        continueButton.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 1500);
    },
    { once: true },
  );

  continueButton.addEventListener("click", hideInvitationEnvelope, { once: true });
}

function hideInvitationEnvelope() {
  const gate = document.querySelector("#invitation-gate");

  gate?.setAttribute("aria-hidden", "true");
  gate?.classList.remove("is-opening", "is-open", "is-ready");
  document.documentElement.classList.remove("has-personal-invitation");
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  if (typeof AOS !== "undefined") {
    window.setTimeout(() => AOS.refreshHard(), 0);
  }
}

function renderInvitation(invitation) {
  const container = document.querySelector("#contenedor-formulario");
  const family = document.querySelector("#rsvp-family");
  const guests = document.querySelector("#rsvp-guests");
  const form = document.querySelector("#rsvp-form");

  if (!container || !family || !guests || !form) return;

  family.textContent = invitation.family
    ? `Familia ${invitation.family}`
    : "Nos alegra contar con ustedes";
  guests.replaceChildren();

  invitation.guests.forEach((guest) => {
    const label = document.createElement("label");
    label.className = "rsvp-guest-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "guest";
    checkbox.value = guest.id;
    checkbox.checked = guest.attendance === "si";

    const name = document.createElement("span");
    name.textContent = guest.name;

    label.append(checkbox, name);
    guests.append(label);
  });

  if (invitation.responded) {
    showSuccess(
      invitation.guests.filter((guest) => guest.attendance === "si").length,
      true,
    );
    return;
  }

  form.addEventListener("change", (event) => {
    const decline = form.querySelector("#rsvp-decline");
    if (event.target === decline && decline.checked) {
      form.querySelectorAll("input[name='guest']").forEach((input) => {
        input.checked = false;
      });
    } else if (event.target.name === "guest" && event.target.checked) {
      decline.checked = false;
    }
    document.querySelector("#rsvp-error")?.classList.add("hidden");
  });
  form.addEventListener("submit", submitRsvp);
  container.classList.remove("hidden");
}

async function submitRsvp(event) {
  event.preventDefault();
  if (!currentInvitation || currentInvitation.responded || rsvpSubmitting) return;

  const form = event.currentTarget;
  const submitButton = document.querySelector("#rsvp-submit");
  const fieldset = form.querySelector("fieldset");
  const selectedGuestIds = [
    ...form.querySelectorAll("input[name='guest']:checked"),
  ].map((input) => input.value);
  const declined = form.querySelector("#rsvp-decline").checked;

  if (!selectedGuestIds.length && !declined) {
    showRsvpError("Selecciona al menos una persona o marca «No podemos asistir».");
    return;
  }
  if (selectedGuestIds.length && declined) {
    showRsvpError("Elige quiénes asisten o indica que no pueden asistir.");
    return;
  }
  const submissionId = createSubmissionId();

  rsvpSubmitting = true;
  document.querySelector("#rsvp-error")?.classList.add("hidden");
  if (fieldset) fieldset.disabled = true;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Guardando...";
  }

  try {
    const body = new FormData();
    body.append("action", "confirm");
    body.append("token", currentInvitation.token);
    body.append("selectedGuestIds", JSON.stringify(selectedGuestIds));
    body.append("attendance", declined ? "no" : "si");
    body.append("submissionId", submissionId);
    body.append("pageUrl", window.location.href);

    await fetch(RSVP_CONFIG.googleScriptUrl, {
      method: "POST",
      mode: "no-cors",
      body,
    });
    if (submitButton) submitButton.textContent = "Confirmando registro...";
    const receipt = await loadJsonp({
      action: "receipt",
      token: currentInvitation.token,
      submissionId,
    });
    if (receipt?.ok && receipt.received) {
      currentInvitation.responded = true;
      currentInvitation.guests.forEach((guest) => {
        guest.attendance = selectedGuestIds.includes(guest.id) ? "si" : "no";
      });
      showSuccess(selectedGuestIds.length);
    } else if (receipt?.invitation?.responded) {
      Object.assign(currentInvitation, receipt.invitation);
      showSuccess(
        currentInvitation.guests.filter((guest) => guest.attendance === "si").length,
        true,
      );
    } else {
      throw new Error("Response not recorded");
    }
  } catch {
    showRsvpError(
      "No pudimos comprobar el registro. Revisa tu conexión e intenta nuevamente. Si ya se guardó, no se enviará otra respuesta.",
    );
  } finally {
    rsvpSubmitting = false;
    if (fieldset) fieldset.disabled = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar confirmacion";
    }
  }
}

function showSuccess(attendingCount, alreadyResponded = false) {
  const form = document.querySelector("#contenedor-formulario");
  const success = document.querySelector("#mensaje-exito");
  const title = success?.querySelector(".success-title");
  const text = success?.querySelector(".success-text");

  if (title)
    title.textContent = alreadyResponded
      ? "Confirmacion registrada"
      : "Muchas gracias!";
  if (text) {
    const responseSummary = attendingCount
      ? `Registramos la asistencia de ${attendingCount} persona${attendingCount === 1 ? "" : "s"}. Nos vemos el 20 de diciembre!`
      : "Registramos que no podran acompanarnos. Los tendremos presentes en este dia tan especial.";
    text.textContent = alreadyResponded
      ? `Ya recibimos su respuesta. ${responseSummary}`
      : responseSummary;
  }

  form?.classList.add("hidden");
  success?.classList.remove("hidden");
  if (!alreadyResponded) {
    success?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function showRsvpError(message) {
  const error = document.querySelector("#rsvp-error");
  if (!error) return;
  error.textContent = message;
  error.classList.remove("hidden");
  error.focus({ preventScroll: true });
}

function loadJsonp(params) {
  return new Promise((resolve, reject) => {
    const callback = `rsvpJsonp${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const url = new URL(RSVP_CONFIG.googleScriptUrl);
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("JSONP request timed out"));
    }, 10000);

    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
    url.searchParams.set("prefix", callback);

    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP request failed"));
    };

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
    }

    script.src = url.toString();
    document.head.append(script);
  });
}

function createSubmissionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
