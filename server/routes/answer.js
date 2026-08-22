const express = require('express')
const Answer = require('../models/Answer')

const router = express.Router()

// ─── Email via Resend HTTP API ────────────────────────────────────────────────
// Uses a plain HTTPS POST — never blocked by Render/hosting providers.
// Get a free API key at https://resend.com (3,000 emails/month free).
async function sendViaResend({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Ask-Out Site 💌 <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${JSON.stringify(data)}`)
  return data
}

// ─── Helper: build and send the answer email ──────────────────────────────────
async function sendAnswerEmail(answer, dodgeCount, doc) {
  const isYes = answer === 'yes'
  const emoji = isYes ? '💕' : '💔'
  const subject = isYes ? `${emoji} SHE SAID YES! 🎉` : `${emoji} She said no...`

  const dodgeText =
    dodgeCount === 0
      ? "She didn't even try to click No — she went straight for Yes! 😍"
      : dodgeCount === 1
      ? 'She tried to dodge once before saying Yes! 😄'
      : `She tried to dodge the No button ${dodgeCount} time${dodgeCount > 1 ? 's' : ''} before answering! 😅`

  const htmlBody = isYes
    ? `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: auto; padding: 30px; background: #fff0f5; border-radius: 16px; border: 2px solid #f43f5e;">
        <h1 style="color: #f43f5e; text-align: center; font-size: 36px;">💍 She Said YES! 💍</h1>
        <p style="font-size: 18px; color: #333; text-align: center;">Your ask-out site worked! She answered <strong>YES</strong>! 🎉</p>
        <hr style="border: 1px solid #f9a8d4; margin: 20px 0;" />
        <p style="color: #555; font-size: 15px;">🎯 ${dodgeText}</p>
        <p style="color: #888; font-size: 13px; margin-top: 20px;">Answered at: ${new Date(doc.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })} (Sri Lanka time)</p>
        <p style="color: #aaa; font-size: 12px;">MongoDB ID: ${doc._id}</p>
      </div>
    `
    : `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: auto; padding: 30px; background: #f9fafb; border-radius: 16px; border: 2px solid #d1d5db;">
        <h1 style="color: #6b7280; text-align: center; font-size: 32px;">💔 She Said No</h1>
        <p style="font-size: 16px; color: #555; text-align: center;">She answered <strong>No</strong> on the ask-out site.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #888; font-size: 13px;">Answered at: ${new Date(doc.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })} (Sri Lanka time)</p>
        <p style="color: #aaa; font-size: 12px;">MongoDB ID: ${doc._id}</p>
      </div>
    `

  return sendViaResend({ to: process.env.EMAIL_TO, subject, html: htmlBody })
}

// ─── POST /api/answer ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { answer, dodgeCount = 0 } = req.body

  if (!answer || !['yes', 'no'].includes(answer)) {
    return res.status(400).json({ error: 'Invalid answer. Must be "yes" or "no".' })
  }

  // 1. Save to MongoDB
  let doc
  try {
    doc = await Answer.create({
      answer,
      dodgeCount,
      userAgent: req.headers['user-agent'] || '',
    })
    console.log(`✅ Answer saved to MongoDB: ${answer} (dodges: ${dodgeCount}) — id: ${doc._id}`)
  } catch (dbErr) {
    console.error('❌ MongoDB save failed:', dbErr.message)
    return res.status(500).json({ error: 'Database error', details: dbErr.message })
  }

  // 2. Respond immediately so the frontend isn't waiting on email
  res.status(200).json({ success: true, message: `Answer "${answer}" saved.`, id: doc._id })

  // 3. Send email after response (fire-and-forget)
  try {
    console.log(`📧 Sending email via Resend → ${process.env.EMAIL_TO}`)
    const info = await sendAnswerEmail(answer, dodgeCount, doc)
    console.log(`📧 Email sent! id: ${info.id}`)
  } catch (mailErr) {
    console.error('❌ Email failed:', mailErr.message)
  }
})

// ─── GET /api/answer/test-email ───────────────────────────────────────────────
// Open in browser to verify Resend is working:
// https://ask-out-1.onrender.com/api/answer/test-email
router.get('/test-email', async (req, res) => {
  console.log('🧪 Test email triggered')
  console.log('   RESEND_API_KEY set?', !!process.env.RESEND_API_KEY)
  console.log('   EMAIL_TO:', process.env.EMAIL_TO)

  try {
    const info = await sendViaResend({
      to: process.env.EMAIL_TO,
      subject: '🧪 Test email from Ask-Out backend',
      html: '<p style="font-family:sans-serif">If you can read this, <strong>Resend is working!</strong> 🎉</p>',
    })
    console.log('📧 Test email sent! id:', info.id)
    res.json({ success: true, id: info.id })
  } catch (err) {
    console.error('❌ Test email failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
