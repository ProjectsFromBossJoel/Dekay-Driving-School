export default async function handler(req, res) {
  // ── CORS HEADERS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to_name, course_name, to_email, login_link } = req.body;

  if (!to_name || !course_name || !to_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Debug: Check if env vars exist
  console.log('Env vars present:', {
    service: !!process.env.EMAILJS_SERVICE_ID,
    template: !!process.env.EMAILJS_TEMPLATE_ID,
    publicKey: !!process.env.EMAILJS_PUBLIC_KEY,
    privateKey: !!process.env.EMAILJS_PRIVATE_KEY
  });

  try {
    const requestBody = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_name,
        course_name,
        to_email,
        login_link
      }
    };

    console.log('Sending to EmailJS...');

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAILJS_PRIVATE_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.text();
    console.log('EmailJS response status:', response.status);
    console.log('EmailJS response body:', result);

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to send email', details: result });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}