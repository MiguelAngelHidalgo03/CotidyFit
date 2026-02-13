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

document.addEventListener('DOMContentLoaded', function() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(ENV.EMAILJS_PUBLIC_KEY);
  }
  document.getElementById('contactForm')?.addEventListener("submit", handleFormSubmit);
});

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
  
  const htmlMessage = `<h2>Nueva solicitud de CotidyFit</h2><p><strong>Nombre:</strong> ${formData.nombre}</p><p><strong>Email:</strong> ${formData.email}</p><p><strong>Frecuencia:</strong> ${formData.frecuencia}</p><p><strong>Personas:</strong> ${formData.personas}</p><p><strong>Objetivo:</strong> ${formData.objetivo}</p><p><strong>Lesiones:</strong> ${formData.lesion || 'Ninguna'}</p><p><strong>Edad:</strong> ${formData.edad}</p><p><strong>Lugar:</strong> ${formData.lugar}</p><p><strong>Disponibilidad:</strong> ${formData.disponibilidad}</p><p><strong>Frecuencia deseada:</strong> ${formData.frecuencia_deseada}</p><p><strong>Cuándo empezar:</strong> ${formData.inicio}</p><p><strong>Peso:</strong> ${formData.peso ? formData.peso + ' kg' : 'N/A'}</p><p><strong>Altura:</strong> ${formData.altura ? formData.altura + ' cm' : 'N/A'}</p>`;
  
  emailjs.send(ENV.EMAILJS_SERVICE_ID, ENV.EMAILJS_TEMPLATE_ID, {
    to_email: "cotidyfit@gmail.com",
    from_email: formData.email,
    from_name: formData.nombre,
    message: htmlMessage,
    ...formData
  }).then(() => {
    formMessage.className = "form-message success";
    formMessage.textContent = "✓ ¡Solicitud enviada con éxito! Te contactaremos pronto.";
    document.getElementById("contactForm")?.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Solicitud";
    setTimeout(() => {
      formMessage.classList.remove("success");
      formMessage.textContent = "";
    }, 5000);
  }, () => {
    formMessage.className = "form-message error";
    formMessage.textContent = "✗ Error al enviar. Por favor intenta nuevamente.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Solicitud";
    setTimeout(() => {
      formMessage.classList.remove("error");
      formMessage.textContent = "";
    }, 5000);
  });
}
