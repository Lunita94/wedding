document.addEventListener("DOMContentLoaded", function() {
    
    // 1. INICIALIZAR ANIMACIONES
    AOS.init({ duration: 1000, once: true });

    // 2. LÓGICA DEL CONTADOR
    const weddingDate = new Date(2026, 11, 20, 17, 0, 0).getTime();

    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("days");
        if (daysEl) {
            daysEl.innerHTML = d;
            document.getElementById("hours").innerHTML = h;
            document.getElementById("minutes").innerHTML = m;
            document.getElementById("seconds").innerHTML = s;
        }

        if (distance < 0) {
            clearInterval(timer);
            document.getElementById("countdown").innerHTML = "¡ES HOY!";
        }
    }, 1000);

    // 3. LÓGICA DEL FORMULARIO (VALIDACIÓN + MENSAJE)
    const rsvpForm = document.getElementById('rsvp-form');
    const contenedorForm = document.getElementById('contenedor-formulario');
    const mensajeExito = document.getElementById('mensaje-exito');

    if (rsvpForm) {
        rsvpForm.addEventListener('click', function(event) {
            // El navegador valida los campos 'required' automáticamente antes de entrar aquí
            event.preventDefault(); // Evita que la página se refresque

            // Animación de transición
            contenedorForm.style.opacity = "0";
            setTimeout(() => {
                contenedorForm.classList.add('hidden');
                mensajeExito.classList.remove('hidden');
                mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        });
    }
});