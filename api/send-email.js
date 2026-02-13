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

    // Obtener API keys
    const resendApiKey = process.env.RESEND_API_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ success: false });
    }
    
    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ success: false });
    }

    // Logo - usando imagen webp desde GitHub público
    const logoUrl = 'https://raw.githubusercontent.com/MiguelAngelHidalgo03/CotidyFit/main/img/Logo%20solo%20dibujo.webp';

    // Función auxiliar para crear el contenido HTML
    const createEmailTemplate = (isCompanyEmail = false) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        
        /* Header */
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 40px 20px; text-align: center; }
        .logo-box { margin-bottom: 15px; }
        .logo-box img { max-width: 100px; height: 100px; width: 100px; display: block; margin: 0 auto; border-radius: 50%; background: white; padding: 10px; box-sizing: border-box; }
        .header h1 { color: white; font-size: 28px; margin: 10px 0; }
        .header p { color: rgba(255,255,255,0.9); font-size: 14px; }
        
        /* Content */
        .content { padding: 40px; }
        .greeting { margin-bottom: 30px; }
        .greeting h2 { color: #1e3a8a; font-size: 20px; margin-bottom: 10px; }
        .greeting p { color: #6b7280; line-height: 1.8; margin-bottom: 5px; }
        
        /* Section */
        .section { margin-bottom: 30px; }
        .section-title { font-size: 14px; font-weight: 700; color: white; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 10px 15px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .info-item { background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .info-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.3px; }
        .info-value { font-size: 15px; color: #1f2937; font-weight: 500; word-break: break-word; }
        
        /* Highlight */
        .highlight { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px; margin-top: 25px; text-align: center; }
        .highlight p { margin: 5px 0; font-size: 14px; }
        .highlight strong { font-size: 16px; }
        
        /* Contact Card */
        .contact-card { background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .contact-card p { margin: 5px 0; color: #1e3a8a; }
        .contact-card a { color: #1e40af; text-decoration: none; font-weight: 600; }
        .contact-card a:hover { text-decoration: underline; }
        
        
        /* Footer */
        .footer { background: #f3f4f6; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 12px; }
        .socials { margin-top: 10px; }
        .socials a { display: inline-block; margin: 0 8px; color: #1e40af; text-decoration: none; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="wrapper">
            <!-- Header -->
            <div class="header">
                <div class="logo-box">
                    <img src="${logoUrl}" alt="CotidyFit" style="max-width: 100px; height: auto; display: block; margin: 0 auto;" />
                </div>
                <h1>CotidyFit</h1>
                <p>Entrenamiento inteligente y personalizado</p>
            </div>

            <!-- Content -->
            <div class="content">
                ${isCompanyEmail ? `
                <div class="greeting">
                    <h2>🔥 Nueva Solicitud Recibida</h2>
                    <p><strong>${nombre}</strong> ha completado el formulario de solicitud y está listo para empezar su transformación.</p>
                </div>
                ` : `
                <div class="greeting">
                    <h2>¡Hola ${nombre.split(' ')[0]}! 👋</h2>
                    <p>Gracias por tu interés en <strong>CotidyFit</strong>. Hemos recibido tu solicitud y pronto nuestro equipo se pondrá en contacto contigo para personalizar tu plan de entrenamiento.</p>
                </div>
                `}

                <!-- Información Personal -->
                <div class="section">
                    <div class="section-title">👤 Información Personal</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Nombre</div>
                            <div class="info-value">${nombre}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email de Contacto</div>
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
                            <div class="info-label">Lesiones / Molestias</div>
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

                <!-- Highlight Section -->
                <div class="highlight">
                    <p><strong>✨ ¡Tu transformación empieza ahora!</strong></p>
                    <p>Nuestro equipo de expertos está listo para ayudarte a alcanzar tus objetivos.</p>
                </div>

                <!-- Contact Info -->
                <div class="contact-card">
                    <p><strong>¿Necesitas ayuda?</strong></p>
                    <p>📞 <a href="tel:+34644595576">+34 644 595 576</a></p>
                    <p>📧 <a href="mailto:cotidyfit@gmail.com">cotidyfit@gmail.com</a></p>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p><strong>CotidyFit - Cada día Fit</strong></p>
                <p>Entrenamiento inteligente y personalizado</p>
                <div class="socials">
                    <a href="https://www.instagram.com/cotidyfit/" target="_blank">Instagram</a> •
                    <a href="https://www.tiktok.com/@cotidyfit" target="_blank">TikTok</a> •
                    <a href="https://www.youtube.com/@cotidyfit" target="_blank">YouTube</a> •
                    <a href="https://www.linkedin.com/company/cotidyfit" target="_blank">LinkedIn</a>
                </div>
                <p style="margin-top: 15px; font-size: 11px;">© 2026 CotidyFit - Todos los derechos reservados</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Enviar email a la empresa
    try {
      const companyEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CotidyFit <noreply@resend.dev>',
          to: 'cotidyfit@gmail.com',
          replyTo: email,
          subject: `🔥 Nueva solicitud de ${nombre}`,
          html: createEmailTemplate(true)
        })
      });

      const companyData = await companyEmailResponse.json();
      if (!companyEmailResponse.ok) {
        console.error('Company email failed:', companyData);
      } else {
        console.log('Company email sent successfully:', companyData);
      }
    } catch (error) {
      console.error('Company email exception:', error.message);
    }

    // Pequeña espera para evitar problemas de rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));

    // Enviar email al cliente - Gmail SMTP
    let clientEmailSent = false;
    try {
      console.log('=== INICIANDO ENVIO A CLIENTE VIA GMAIL ===');
      console.log('Email destino:', email);
      
      // Usar nodemailer con Gmail SMTP
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        }
      });

      const mailOptions = {
        from: `CotidyFit <${gmailUser}>`,
        to: email,
        subject: '¡Solicitud recibida! CotidyFit',
        html: createEmailTemplate(false),
        replyTo: 'cotidyfit@gmail.com'
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email cliente enviado exitosamente:', info.messageId);
      clientEmailSent = true;
    } catch (error) {
      console.error('❌ Error enviando email al cliente:', error.message);
    }

    // Devolver éxito en ambos casos
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false });
  }
};
