const RSVP_CONFIG = {
  weddingDate: "2026-12-20T15:00:00-06:00",
  tokenParam: "i",
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbzLt7XX8q3hAMgll69_9A62IW1qB5sb86sKdoYy3la2NO7FdRPGQr2jTcnnqcu_lIFN/exec",
};

let currentInvitation = null;
let carouselIndex = 0;
let carouselTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      offset: 120,
      easing: 'ease-in-out'
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
    })
    .catch(() => {
      loading?.classList.add("hidden");
      noLink?.classList.remove("hidden");
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

  form.addEventListener("submit", submitRsvp, { once: true });
  container.classList.remove("hidden");
}

async function submitRsvp(event) {
  event.preventDefault();
  if (!currentInvitation) return;

  const form = event.currentTarget;
  const submitButton = document.querySelector("#rsvp-submit");
  const selectedGuestIds = [
    ...form.querySelectorAll("input[name='guest']:checked"),
  ].map((input) => input.value);
  const submissionId = createSubmissionId();

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Guardando...";
  }

  try {
    const body = new FormData();
    body.append("action", "confirm");
    body.append("token", currentInvitation.token);
    body.append("selectedGuestIds", JSON.stringify(selectedGuestIds));
    body.append("submissionId", submissionId);
    body.append("pageUrl", window.location.href);

    await fetch(RSVP_CONFIG.googleScriptUrl, {
      method: "POST",
      mode: "no-cors",
      body,
    });
    currentInvitation.responded = true;
    showSuccess(selectedGuestIds.length);
  } catch {
    showRsvpError(
      "No pudimos guardar la respuesta. Revisa tu conexion e intentalo de nuevo.",
    );
    form.addEventListener("submit", submitRsvp, { once: true });
  } finally {
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
  success?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showRsvpError(message) {
  const loading = document.querySelector("#rsvp-loading");
  if (!loading) return;
  loading.textContent = message;
  loading.classList.remove("hidden");
}

function loadJsonp(params) {
  return new Promise((resolve, reject) => {
    const callback = `rsvpJsonp${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const url = new URL(RSVP_CONFIG.googleScriptUrl);
    const script = document.createElement("script");
    const timeout = window.setTimeout(cleanup, 10000);

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


// Función para pausar / reproducir manualmente al hacer clic
function toggleMusica() {
    const audio = document.getElementById('musica');
    const noteSvg = document.getElementById('note-svg');
    const slashSvg = document.getElementById('slash-svg');

    if (!audio) return;

    if (audio.paused) {
        audio.play().then(() => {
            if (noteSvg) noteSvg.classList.add('note-playing');
            if (slashSvg) slashSvg.style.opacity = '0';
        }).catch(error => {
            console.error("Error al reproducir audio:", error);
        });
    } else {
        audio.pause();
        if (noteSvg) noteSvg.classList.remove('note-playing');
        if (slashSvg) slashSvg.style.opacity = '1';
    }
}

// Intentar iniciar la música automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('musica');
    const noteSvg = document.getElementById('note-svg');
    const slashSvg = document.getElementById('slash-svg');

    if (!audio) return;

    // Intentamos reproducir de entrada
    audio.play().then(() => {
        // Si el navegador lo permite, activa la corchea en movimiento y oculta la raya
        if (noteSvg) noteSvg.classList.add('note-playing');
        if (slashSvg) slashSvg.style.opacity = '0';
    }).catch(() => {
        // Si el navegador bloquea el autoplay con sonido, se inicia con el primer clic en la pantalla
        const activarEnPrimerClic = () => {
            audio.play().then(() => {
                if (noteSvg) noteSvg.classList.add('note-playing');
                if (slashSvg) slashSvg.style.opacity = '0';
            }).catch(e => console.log(e));
            document.removeEventListener('click', activarEnPrimerClic);
        };
        document.addEventListener('click', activarEnPrimerClic);
    });
});



