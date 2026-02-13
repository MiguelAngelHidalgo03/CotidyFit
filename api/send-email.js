export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { nombre, email, frecuencia, objetivo, personas, lesion, edad, lugar, disponibilidad, frecuencia_deseada, inicio, peso, altura } = req.body;

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
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const htmlMessage = `
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

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'Email service error' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
