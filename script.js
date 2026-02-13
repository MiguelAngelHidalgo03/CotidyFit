const scrollThreshold = 120;
let topBarScrolled = null;

window.addEventListener('scroll', function() {
  if (!topBarScrolled) {
    topBarScrolled = document.querySelector('.top-bar-scrolled');
    if (!topBarScrolled) return;
  }

  const currentScrollY = window.scrollY;
  const isVisible = currentScrollY > scrollThreshold;
  const hasVisible = topBarScrolled.classList.contains('visible');

  if (isVisible && !hasVisible) {
    topBarScrolled.classList.add('visible');
  } else if (!isVisible && hasVisible && currentScrollY < scrollThreshold - 50) {
    topBarScrolled.classList.remove('visible');
  }
}, { passive: true });

function scrollToContact() {
  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.querySelector(".btn-submit");
  const formMessage = document.getElementById("formMessage");
  if (!submitBtn || !formMessage) return;
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  
  const formData = {
    nombre: document.getElementById("nombre")?.value || '',
    email: document.getElementById("email")?.value || '',
    frecuencia: document.getElementById("frecuencia")?.value || '',
    personas: document.getElementById("personas")?.value || '',
    objetivo: document.getElementById("objetivo")?.value || '',
    lesion: document.getElementById("lesion")?.value || '',
    edad: document.getElementById("edad")?.value || '',
    lugar: document.getElementById("lugar")?.value || '',
    disponibilidad: document.getElementById("disponibilidad")?.value || '',
    frecuencia_deseada: document.getElementById("frecuencia_deseada")?.value || '',
    inicio: document.getElementById("inicio")?.value || '',
    peso: document.getElementById("peso")?.value || '',
    altura: document.getElementById("altura")?.value || ''
  };
  
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      formMessage.className = "form-message success";
      formMessage.textContent = "✓ ¡Solicitud enviada con éxito! Te contactaremos pronto.";
      document.getElementById("contactForm")?.reset();
      setTimeout(() => {
        formMessage.classList.remove("success");
        formMessage.textContent = "";
      }, 5000);
    } else {
      formMessage.className = "form-message error";
      formMessage.textContent = "✗ Error al enviar. Por favor intenta nuevamente.";
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Solicitud";
  })
  .catch(() => {
    formMessage.className = "form-message error";
    formMessage.textContent = "✗ Error al enviar. Por favor intenta nuevamente.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Solicitud";
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('contactForm')?.addEventListener("submit", handleFormSubmit);
});
