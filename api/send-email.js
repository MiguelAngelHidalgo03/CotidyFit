module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    const { nombre, email, frecuencia, objetivo, personas, lesion, edad, lugar, disponibilidad, frecuencia_deseada, inicio, peso, altura } = req.body || {};

    // Validar campos requeridos
    if (!nombre || !email || !frecuencia || !objetivo) {
      return res.status(400).json({ success: false });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false });
    }

    // Obtener API key de Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ success: false });
    }

    // Construir contenido HTML del email
    const htmlContent = `
      <h2>Nueva solicitud de CotidyFit</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Frecuencia actual:</strong> ${frecuencia}</p>
      <p><strong>Personas:</strong> ${personas || 'No especificado'}</p>
      <p><strong>Objetivo:</strong> ${objetivo}</p>
      <p><strong>Lesiones:</strong> ${lesion || 'Ninguna'}</p>
      <p><strong>Edad:</strong> ${edad || 'No especificado'}</p>
      <p><strong>Lugar:</strong> ${lugar || 'No especificado'}</p>
      <p><strong>Disponibilidad:</strong> ${disponibilidad || 'No especificado'}</p>
      <p><strong>Frecuencia deseada:</strong> ${frecuencia_deseada || 'No especificado'}</p>
      <p><strong>Cuándo empezar:</strong> ${inicio || 'No especificado'}</p>
      <p><strong>Peso:</strong> ${peso ? peso + ' kg' : 'No especificado'}</p>
      <p><strong>Altura:</strong> ${altura ? altura + ' cm' : 'No especificado'}</p>
    `;

    // Enviar email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CotidyFit <onboarding@resend.dev>',
        to: 'cotidyfit@gmail.com',
        replyTo: email,
        subject: `Nueva solicitud de ${nombre}`,
        html: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ success: false });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false });
  }
};
