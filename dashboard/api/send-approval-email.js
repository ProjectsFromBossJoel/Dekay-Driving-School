export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to_name, course_name, to_email, login_link } = req.body;

  if (!to_name || !course_name || !to_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name,
          course_name,
          to_email,
          login_link
        }
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const error = await response.text();
      console.error('EmailJS error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}