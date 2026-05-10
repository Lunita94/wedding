const weddingConfig = {
  date: "2026-12-20T15:00:00-06:00",
  couple: "Liss y Jose",
  storageKey: "rsvp-liss-jose",
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbwHMVeEiP72EDs38p4jHIDn71tr5UFusFWjnrHQCxxTMfgsIr6UOk_plANY2ijRE6m2/exec",
};

const countdownNodes = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  wrapper: document.querySelector("#countdown"),
};

function updateCountdown() {
  const weddingDate = new Date(weddingConfig.date).getTime();
  const now = Date.now();
  const remaining = weddingDate - now;

  if (remaining <= 0) {
    countdownNodes.wrapper.textContent = "Llego el gran dia!";
    return;
  }

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(remaining / day);
  const hours = Math.floor((remaining % day) / hour);
  const minutes = Math.floor((remaining % hour) / minute);
  const seconds = Math.floor((remaining % minute) / second);

  countdownNodes.days.textContent = String(days).padStart(2, "0");
  countdownNodes.hours.textContent = String(hours).padStart(2, "0");
  countdownNodes.minutes.textContent = String(minutes).padStart(2, "0");
  countdownNodes.seconds.textContent = String(seconds).padStart(2, "0");
}

function setupMusic() {
  const button = document.querySelector("#musicToggle");
  const song = document.querySelector("#song");

  if (!button || !song) return;

  button.addEventListener("click", async () => {
    if (song.paused) {
      try {
        await song.play();
        button.innerHTML = "&#10074;&#10074;";
        button.setAttribute("aria-label", "Pausar cancion");
      } catch {
        button.innerHTML = "&#9658;";
      }
    } else {
      song.pause();
      button.innerHTML = "&#9658;";
      button.setAttribute("aria-label", "Reproducir cancion");
    }
  });
}

function parseGuestNames(value) {
  return value
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function buildRsvpPayload(names, attendance) {
  return {
    couple: weddingConfig.couple,
    names,
    namesText: names.join(", "),
    guestCount: names.length,
    attendance,
    attendanceText:
      attendance === "si" ? "Si asistiremos" : "No podremos asistir",
    confirmedAt: new Date().toISOString(),
    pageUrl: window.location.href,
  };
}

function saveRsvpLocally(response) {
  localStorage.setItem(weddingConfig.storageKey, JSON.stringify(response));
}

async function sendRsvpToGoogleSheets(response) {
  if (!weddingConfig.googleScriptUrl) return false;

  const formData = new FormData();
  Object.entries(response).forEach(([key, value]) => {
    formData.append(key, Array.isArray(value) ? value.join("\n") : value);
  });

  await fetch(weddingConfig.googleScriptUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });

  return true;
}

function showRsvpMessage(successMessage, response, sentToSheets) {
  const countText =
    response.names.length === 1
      ? "1 persona"
      : `${response.names.length} personas`;
  const attendanceText =
    response.attendance === "si" ? "confirmada" : "registrada";
  const destinationText = sentToSheets
    ? "Tambien enviamos la respuesta a la hoja de confirmaciones."
    : "Guardamos la respuesta en este navegador.";

  successMessage.hidden = false;
  successMessage.innerHTML = `
    <strong>Confirmacion ${attendanceText}.</strong><br>
    Respuesta para ${countText}: ${response.names.join(", ")}.<br>
    ${destinationText}
  `;
}

function setupRsvp() {
  const form = document.querySelector("#rsvpForm");
  const namesInput = document.querySelector("#guestNames");
  const attendanceInput = document.querySelector("#attendance");
  const successMessage = document.querySelector("#successMessage");
  const submitButton = form?.querySelector("button[type='submit']");

  if (!form || !namesInput || !attendanceInput || !successMessage) return;

  const saved = localStorage.getItem(weddingConfig.storageKey);
  if (saved) {
    const rsvp = JSON.parse(saved);
    namesInput.value = rsvp.names.join(", ");
    attendanceInput.value = rsvp.attendance;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const names = parseGuestNames(namesInput.value);
    const attendance = attendanceInput.value;

    if (!names.length) {
      namesInput.focus();
      return;
    }

    const response = buildRsvpPayload(names, attendance);
    saveRsvpLocally(response);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const sentToSheets = await sendRsvpToGoogleSheets(response);
      showRsvpMessage(successMessage, response, sentToSheets);
      form.reset();
    } catch {
      successMessage.hidden = false;
      successMessage.innerHTML = `
        <strong>No pudimos enviar la confirmacion.</strong><br>
        La respuesta quedo guardada en este navegador. Intentalo de nuevo en unos minutos.
      `;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Confirmar asistencia";
      }
    }
  });
}

function setupRevealAnimation() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

updateCountdown();
setInterval(updateCountdown, 1000);
setupMusic();
setupRsvp();
setupRevealAnimation();
