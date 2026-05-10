document.addEventListener("DOMContentLoaded", function () {

    // ═══════════════════════════════════════════════
    // AOS
    // ═══════════════════════════════════════════════
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // ═══════════════════════════════════════════════
    // CONTADOR REGRESIVO
    // ═══════════════════════════════════════════════
    const weddingDate = new Date(2026, 11, 20, 15, 0, 0).getTime();

    const countdown = document.getElementById("countdown");

    function actualizarContador() {

        if (!countdown) return;

        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance <= 0) {
            countdown.innerHTML = "<span class='count-today'>¡Es hoy! 💍</span>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) /
            (1000 * 60)
        );

        const seconds = Math.floor(
            (distance % (1000 * 60)) / 1000
        );

        document.getElementById("days").textContent =
            String(days).padStart(2, "0");

        document.getElementById("hours").textContent =
            String(hours).padStart(2, "0");

        document.getElementById("minutes").textContent =
            String(minutes).padStart(2, "0");

        document.getElementById("seconds").textContent =
            String(seconds).padStart(2, "0");
    }

    actualizarContador();
    setInterval(actualizarContador, 1000);

    // ═══════════════════════════════════════════════
    // RSVP
    // ═══════════════════════════════════════════════
    const rsvpForm = document.getElementById("rsvp-form");
    const contenedorForm = document.getElementById("contenedor-formulario");
    const mensajeExito = document.getElementById("mensaje-exito");

    if (rsvpForm && contenedorForm && mensajeExito) {

        rsvpForm.addEventListener("submit", function (e) {

            e.preventDefault();

            const nombreInput = rsvpForm.querySelector("input");

            if (!nombreInput.value.trim()) {
                nombreInput.focus();
                return;
            }

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

    // ═══════════════════════════════════════════════
    // CARRUSEL
    // ═══════════════════════════════════════════════
    const carousel = document.getElementById("carousel");
    const dots = document.querySelectorAll(".dot");

    let carouselIndex = 0;
    const totalSlides = dots.length;

    function goToSlide(index) {

        if (!carousel) return;

        carouselIndex = (index + totalSlides) % totalSlides;

        carousel.style.transform =
            `translateX(-${carouselIndex * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === carouselIndex);
        });
    }

    // Funciones globales para botones HTML
    window.moverCarruselManual = function (dir) {
        clearInterval(autoTimer);
        goToSlide(carouselIndex + dir);
        iniciarAutoSlide();
    };

    window.irASlide = function (index) {
        clearInterval(autoTimer);
        goToSlide(index);
        iniciarAutoSlide();
    };

    function iniciarAutoSlide() {
        autoTimer = setInterval(() => {
            goToSlide(carouselIndex + 1);
        }, 4000);
    }

    let autoTimer;
    iniciarAutoSlide();

});


// ═══════════════════════════════════════════════
// MÚSICA
// ═══════════════════════════════════════════════
function toggleMusica() {

    const audio = document.getElementById("musica");
    const icon = document.getElementById("music-icon");
    const label = document.getElementById("music-label");

    if (!audio) return;

    if (audio.paused) {

        audio.play().catch(error => {
            console.log(error);
        });

        icon.textContent = "♬";
        label.textContent = "Pausar música";

    } else {

        audio.pause();

        icon.textContent = "♪";
        label.textContent = "Reproducir música";
    }
}