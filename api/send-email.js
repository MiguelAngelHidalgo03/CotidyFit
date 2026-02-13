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

    // Construir contenido HTML del email con estilos profesionales
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; font-weight: 600; color: #667eea; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { background: #f3f4f6; padding: 12px 15px; border-radius: 6px; border-left: 3px solid #667eea; }
        .info-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 15px; color: #1f2937; font-weight: 500; }
        .cta-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 6px; text-align: center; margin-top: 25px; }
        .cta-section p { margin: 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
        .highlight { background: #fef3c7; padding: 12px; border-left: 3px solid #f59e0b; border-radius: 4px; margin: 15px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Nueva Solicitud de CotidyFit</h1>
            <p>Formulario de entrenamiento personalizado</p>
        </div>

        <div class="content">
            <!-- Información Personal -->
            <div class="section">
                <div class="section-title">👤 Información Personal</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Nombre</div>
                        <div class="info-value">${nombre}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${email}</div>
                    </div>
                </div>
            </div>

            <!-- Información de Entrenamiento -->
            <div class="section">
                <div class="section-title">💪 Información de Entrenamiento</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Frecuencia Actual</div>
                        <div class="info-value">${frecuencia}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Objetivo Principal</div>
                        <div class="info-value">${objetivo}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Número de Personas</div>
                        <div class="info-value">${personas || 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Frecuencia Deseada</div>
                        <div class="info-value">${frecuencia_deseada || 'No especificado'}</div>
                    </div>
                </div>
            </div>

            <!-- Información de Salud -->
            <div class="section">
                <div class="section-title">🏥 Información de Salud</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Edad</div>
                        <div class="info-value">${edad || 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Peso</div>
                        <div class="info-value">${peso ? peso + ' kg' : 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Altura</div>
                        <div class="info-value">${altura ? altura + ' cm' : 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Lesiones</div>
                        <div class="info-value">${lesion || 'Ninguna'}</div>
                    </div>
                </div>
            </div>

            <!-- Información de Preferencias -->
            <div class="section">
                <div class="section-title">📍 Preferencias</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Lugar de Entrenamiento</div>
                        <div class="info-value">${lugar || 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Disponibilidad</div>
                        <div class="info-value">${disponibilidad || 'No especificado'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Cuándo Empezar</div>
                        <div class="info-value">${inicio || 'No especificado'}</div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
                <p><strong>✨ ¡Gracias por tu interés!</strong></p>
                <p>Nos pondremos en contacto pronto para personalizar tu plan de entrenamiento.</p>
            </div>

            <div class="highlight">
                <strong>⚡ Respuesta rápida:</strong> Nuestro equipo responderá en las próximas 24 horas. Puedes contactar directamente a través de WhatsApp +34 644 595 576
            </div>
        </div>

        <div class="footer">
            <p>© 2026 CotidyFit - Entrenamiento inteligente y personalizado</p>
            <p>
                <a href="https://www.instagram.com/cotidyfit/" style="color: #667eea; text-decoration: none;">Instagram</a> | 
                <a href="https://www.tiktok.com/@cotidyfit" style="color: #667eea; text-decoration: none;">TikTok</a> | 
                <a href="https://www.youtube.com/@cotidyfit" style="color: #667eea; text-decoration: none;">YouTube</a>
            </p>
        </div>
    </div>
</body>
</html>
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
