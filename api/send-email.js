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

    // Logo base64 SVG - incrustado directamente en el email para máxima compatibilidad
    const logoBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB3aWR0aD0iMTUwbW0iCiAgIGhlaWdodD0iMTUwbW0iCiAgIHZpZXdCb3g9IjAgMCAxNTAgMTUwIgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxIgogICB4bWw6c3BhY2U9InByZXNlcnZlIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjQgKDg2YThhZDcsIDIwMjQtMTAtMTEpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJMb2dvIHNpbiAgbGVtYS5zdmciCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmlsd25zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBpZD0ibmFtZWR2aWV3MSIKICAgICBwYWdlY29sb3I9IiM1MDUwNTAiCiAgICAgYm9yZGVyY29sb3I9IiNlZWVlZWUiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBpbmtzY2FwZTpzaG93cGFnZXNoYWRvdz0iMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIgogICAgIGlua3NjYXBlOmRlc2tjb2xvcj0iIzUwNTA1MCIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0ibW0iCiAgICAgaW5rc2NhcGU6em9vbT0iMC43MzUxMjYxNyIKICAgICBpbmtzY2FwZTpjeD0iMjc4LjE4MzU0IgogICAgIGlua3NjYXBlOmN5PSIyNDUuNTM2MDgiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNTM2IgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijc5MyIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMjU1MiIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMjAwIgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIgogICAgIGlua3NjYXBlOmxvY2tndWlkZXM9ImZhbHNlIiAvPjxkZWZzCiAgICAgaWQ9ImRlZnMxIj48bGluZWFyR3JhZGllbnQKICAgICAgIGlkPSJzd2F0Y2gxIgogICAgICAgaW5rc2NhcGU6c3dhdGNoPSJzb2xpZCI+PHN0b3AKICAgICAgICAgc3R5bGU9InN0b3AtY29sb3I6I2ZmZmZmZjtzdG9wLW9wYWNpdHk6MTsiCiAgICAgICAgIG9mZnNldD0iMCIKICAgICAgICAgaWQ9InN0b3AxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnCiAgICAgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMCwtODkuOTA0MTgyKSI+PHJlY3QKICAgICAgIHN0eWxlPSJvcGFjaXR5OjAuOTk4MDkyO2ZpbGw6IzI3NDI2YjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4wODM5NTg7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOmZpbGwgbWFya2VycyBzdHJva2UiCiAgICAgICBpZD0icmVjdDMyOTYyIgogICAgICAgd2lkdGg9IjE1MCIKICAgICAgIGhlaWdodD0iMTUwIgogICAgICAgaD0iMzAiCiAgICAgICB5PSI4OS45MDQxODIiCiAgICAgICBzb2RpcG9kaTppbnNlbnNpdGl2ZT0idHJ1ZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJGb25kbyIgLz48dGV4dAogICAgICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZToyOS4zNDY4cHg7Zm9udC1mYW1pbHk6J0NvbG9ubmEgTVQnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J0NvbG9ubmEgTVQsIE5vcm1hbCc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LXZhcmlhbnQtZWFzdC1hc2lhbjpub3JtYWw7dGV4dC1hbGlnbjpzdGFydDt3cml0aW5nLW1vZGU6bHItdGI7ZGlyZWN0aW9uOmx0cjtddGV4dC1hbmNob3I6c3RhcnQ7b3BhY2l0eTowLjk5ODA5MjtmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIKICAgICAgIHg9IjQ3LjQ1NjcyMiIKICAgICAgIHk9IjIwNS4yNjM3NSIKICAgICAgIGlkPSJ0ZXh0MzI5NjEiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iQ290aWR5Rml0IgogICAgICAgc29kaXBvZGk6aW5zZW5zaXRpdmU9InRydWUiPjx0c3BhbgogICAgICAgICBpZD0idHNwYW4zMjk2MSIKICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjI5LjM0NjhweDtmb250LWZhbWlseTonQ29sb25uYSBNVCc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonQ29sb25uYSBNVCwgTm9ybWFsJztmb250LXZhcmlhbnQtbGlnYXR1cmVzOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtdmFyaWFudC1lYXN0LWFzaWFuOm5vcm1hbDtmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjAuNTtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaHg9IjQ3LjQ1NjcyMiIKICAgICAgICAgeT0iMjA1LjI2Mzc1IgogICAgICAgICBzb2RpcG9kaTpyb2xlPSJsaW5lIj5Db3RpZHk8dHNwYW4KICAgICAgICAgIHN0eWxlPSJzdHJva2U6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MC41O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICAgaWQ9InRzcGFuMzI5NjMiPkZpdDwvdHNwYW4+PC90c3Bhbj48L3RleHQ+PHBhdGgKICAgICAgIGQ9Im0gMTAyLjk2NjQ2LDEzMS45Mzc4NCBjIDEuMzkwNzMsMC42Mjc1NCAyLjQyNTMsMi4zOTEzOSAyLjIyMTc4LDMuNzgyMTMgLTAuMjU0NCwxLjY0NTEzIC0xLjU5NDI2LDMuMDUyODIgLTMuMTIwNjcsMy4yNzMzIC0xLjQ5MjUxLDAuMjAzNTIgLTIuNzQ3NTU4LC0wLjM3MzEzIC0zLjY4MDM1OCwtMS42NzkwNSAtMC40NTc5MiwtMC42MTA1NiAtMC41MDg4LC0wLjgzMTA1IC0wLjUwODgsLTEuODk5NTQgMCwtMS4wMzQ1NiAwLjA2NzgsLTEuMzA1OTIgMC41MDg4LC0yLjAxODI1IDAuOTQ5NzcsLTEuNTQzMzggMi45NjgwMjgsLTIuMTg3ODcgNC41NzkyNDgsLTEuNDU4NTkgeiIKICAgICAgIGlkPSJwYXRoMS02IgogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC42MzIzNjg7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iSW1hZ2VuIgogICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJjY2Njc2NjY3NjY2Njc2NjY3NjY3NzY3Njc2MjMzMjMyMzIzMjMyMzMzMzMzMjMiIC8+PHBhdGgKICAgICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojZmZmZmZmO3N0cm9rZS13aWR0aDowLjM2MjExMTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIKICAgICAgIGlkPSJwYXRoMzI5NjIiCiAgICAgICBkPSJtIDExMy44MTI5NSwxMTkuNDU2NjQgYSAzMi4xMDIwMjgsMzIuMTAyMDI4IDAgMCAxIDIyLjA1NjE3LDM5LjY3OTg3IDMyLjEwMjAyOCwzMi4xMDIwMjggMCAwIDEgLTM5LjY3ODY0NiwyMi4wNTgzNyAzMi4xMDIwMjgsMzIuMTAyMDI4IDAgMCAxIC0yMi4wNjA1NjYsLTM5LjY3NzQyIDMyLjEwMjAyOCwzMi4xMDIwMjggMCAwIDEgMzkuNjc2MjAyLC0yMi4wNjI3NyIKICAgICAgIHNvZGlwb2RpOnR5cGU9ImFyYyIKICAgICAgIHNvZGlwb2RpOmFyYy10eXBlPSJhcmMiCiAgICAgICBzb2RpcG9kaTpzdGFydD0iNC45OTA0ODkxIgogICAgICAgc29kaXBvZGk6ZW5kPSI0Ljk5MDI2NzUiCiAgICAgICBzb2RpcG9kaTpyeT0iMzIuMTAyMDI4IgogICAgICAgc29kaXBvZGk6cng9IjMyLjEwMjAyOCIKICAgICAgIHNvZGlwb2RpOmN5PSIxNTAuMzI1MjciCiAgICAgICBzb2RpcG9kaTpjeD0iMTA1IgogICAgICAgc29kaXBvZGk6b3Blbj0idHJ1ZSIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJDw61yY3VsbyIgLz48cGF0aAogICAgICAgc3R5bGU9Im9wYWNpdHk6MTtmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiMyNzQyNmI7c3Ryb2tlLXdpZHRoOjAuODg0OTQyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MTtwYWludC1vcmRlcjpmaWxsIG1hcmtlcnMgc3Ryb2tlIgogICAgICAgZD0ibSA5Ny42MjQxOTUsMTM4LjcxMTgyIGMgLTUuNDY5NTM2LDguMzY1MTkgLTMuNzMyMzE1LDExLjAzMDc5IC0zLjczMjMxNSwxMS4wMzA3OSIKICAgICAgIGlkPSJwYXRoMzI5NjQiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iTMOtbmVhIHBlcnNvbmEyIgogICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJjYyIgLz48cGF0aAogICAgICAgc3R5bGU9ImZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtzdHJva2U6IzI3NDI2YjtzdHJva2Utd2lkdGg6MC44ODQ5NDI7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxO3BhaW50LW9yZGVyOmZpbGwgbWFya2VycyBzdHJva2UiCiAgICAgICBkPSJtIDk0Ljc3NjEzLDE1Mi41OTc1NCBjIC01LjQ2OTU0NCw4LjM2NTE5IC02LjI2NDgyMiwxMS43NzY2IC02LjI2NDgyMiwxMS43NzY2IE0gOTMuOTUxLDE0OS43NzM3NiBjIDIuNTc0NTksLTAuNDM0ODMgMS41NjY0NiwxLjY2MTYzIDAuNzgzNTksMi44ODY2MyIKICAgICAgIGlkPSJwYXRoMzI5NjQtOCIKICAgICAgIGlua3NjYXBlOmxhYmVsPSJMw61uZWEgcGVyc29uYTEiCiAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY2MiIC8+PHBhdGgKICAgICAgIHN0eWxlPSJvcGFjaXR5OjE7ZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMjc0MjZiO3N0cm9rZS13aWR0aDowLjg4NDk0MjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjE7cGFpbnQtb3JkZXI6ZmlsbCBtYXJrZXJzIHN0cm9rZSIKICAgICAgIGQ9Im0gMTE4Ljk0NjIzLDEzNS4wMjQzNSBjIC0wLjMwNzYxLDUuMjc0MDIgLTMuODAxNzQsOS41OTc5NyAtMy45MjIyNyw5LjcwMjIxIGwyLjMxOTE2LC0wLjEzODU3IDIuODcxNTksLTAuNDE1NDggYyAtMi44NzI1OSwyLjQ2MTU3IC0zLjkxMjc4LDYuMTgwOSAtNC42NzM5MiwxMC4yMzkzOSIKICAgICAgIGlkPSJwYXRoMzI5NjUiCiAgICAgICBpbmtzY2FwZTpsYWJlbD0iTMOtbmVhIHJheW8iCiAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjY2NjIiAvPjwvZz48L3N2Zz4K';

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
        .logo-box img { max-width: 80px; height: auto; display: block; margin: 0 auto; }
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
                    <img src="${logoBase64}" alt="CotidyFit" style="max-width: 100px; height: auto; display: block; margin: 0 auto;" />
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
          from: 'CotidyFit <noreply@cotidyfit.com>',
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
