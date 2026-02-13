module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const { nombre, email, frecuencia, objetivo, personas, lesion, edad, lugar, disponibilidad, frecuencia_deseada, inicio, peso, altura } = body;

    if (!nombre || !email || !frecuencia || !objetivo) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('Missing env vars:', { 
        serviceId: !!serviceId, 
        templateId: !!templateId, 
        publicKey: !!publicKey 
      });
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const htmlMessage = `<h2>Nueva solicitud de CotidyFit</h2><p><strong>Nombre:</strong> ${nombre}</p><p><strong>Email:</strong> ${email}</p><p><strong>Frecuencia actual:</strong> ${frecuencia}</p><p><strong>Personas:</strong> ${personas || 'No especificado'}</p><p><strong>Objetivo:</strong> ${objetivo}</p><p><strong>Lesiones:</strong> ${lesion || 'Ninguna'}</p><p><strong>Edad:</strong> ${edad || 'No especificado'}</p><p><strong>Lugar:</strong> ${lugar || 'No especificado'}</p><p><strong>Disponibilidad:</strong> ${disponibilidad || 'No especificado'}</p><p><strong>Frecuencia deseada:</strong> ${frecuencia_deseada || 'No especificado'}</p><p><strong>Cuándo empezar:</strong> ${inicio || 'No especificado'}</p><p><strong>Peso:</strong> ${peso ? peso + ' kg' : 'No especificado'}</p><p><strong>Altura:</strong> ${altura ? altura + ' cm' : 'No especificado'}</p>`;

    const emailJsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: 'cotidyfit@gmail.com',
        from_email: email,
        from_name: nombre,
        message: htmlMessage,
        nombre,
        email,
        frecuencia,
        personas: personas || '',
        objetivo,
        lesion: lesion || '',
        edad: edad || '',
        lugar: lugar || '',
        disponibilidad: disponibilidad || '',
        frecuencia_deseada: frecuencia_deseada || '',
        inicio: inicio || '',
        peso: peso || '',
        altura: altura || ''
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailJsPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('EmailJS error:', responseData);
      return res.status(500).json({ success: false, error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
