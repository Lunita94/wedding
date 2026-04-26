document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // 1. ANIMACIONES (AOS)
    // =========================
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // =========================
    // 2. CONTADOR REGRESIVO
    // =========================
    const weddingDate = new Date(2026, 11, 20, 17, 0, 0).getTime();

    const countdown = document.getElementById("countdown");

    if (countdown) {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance <= 0) {
                clearInterval(timer);
                countdown.innerHTML = "<span style='font-size:20px;'>¡ES HOY! 💍</span>";
                return;
            }

            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            const daysEl = document.getElementById("days");
            const hoursEl = document.getElementById("hours");
            const minutesEl = document.getElementById("minutes");
            const secondsEl = document.getElementById("seconds");

            if (daysEl && hoursEl && minutesEl && secondsEl) {
                daysEl.textContent = d.toString().padStart(2, '0');
                hoursEl.textContent = h.toString().padStart(2, '0');
                minutesEl.textContent = m.toString().padStart(2, '0');
                secondsEl.textContent = s.toString().padStart(2, '0');
            }

        }, 1000);
    }

    // =========================
    // 3. FORMULARIO RSVP
    // =========================
    const rsvpForm = document.getElementById("rsvp-form");
    const contenedorForm = document.getElementById("contenedor-formulario");
    const mensajeExito = document.getElementById("mensaje-exito");

    if (rsvpForm && contenedorForm && mensajeExito) {

        rsvpForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Validación básica
            const nombre = rsvpForm.querySelector("input");
            if (!nombre.value.trim()) {
                nombre.focus();
                return;
            }

            // Animación de salida
            contenedorForm.style.transition = "opacity 0.4s ease";
            contenedorForm.style.opacity = "0";

            setTimeout(() => {
                contenedorForm.classList.add("hidden");
                mensajeExito.classList.remove("hidden");

                mensajeExito.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 400);
        });
    }

 function toggleMusica() {
    const audio = document.getElementById("musica");

    if (!audio) return;
debugger;
    if (audio.paused) {
        audio.play().catch(err => console.log(err));
    } else {
        audio.pause();
    }
}

// CARRUSEL AUTOMÁTICO
let index = 0;
const carousel = document.getElementById("carousel");

function moverCarrusel() {
    if (!carousel) return;

    const total = carousel.children.length;
    index = (index + 1) % total;

    carousel.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(moverCarrusel, 3000); // cambia cada 3 segundos

});