// --- Webhook notification --------------------------------------------------
// Paste your endpoint below to get pinged the instant she clicks "Yes":
//   - Formspree:  https://formspree.io/f/xxxxxxxx  (create a form, use its endpoint)
//   - EmailJS:    use their REST send URL + public key/template in the body
//   - Your own API: any URL that accepts a POST with a JSON body
//
// Left blank, this quietly does nothing — the app still works fine without it.
const WEBHOOK_URL = ''; // e.g. 'https://formspree.io/f/xxxxxxxx'

export async function notifyYes() {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'She said YES! 💍',
        answer: 'yes',
        timestamp: new Date().toISOString(),
      }),
      // Lets the request finish even if the tab is closed right after.
      keepalive: true,
    });
  } catch (err) {
    // Never let a failed notification interrupt her success moment.
    console.warn('Webhook notification failed:', err);
  }
}
