const express = require('express')
const nodemailer = require('nodemailer')
const Answer = require('../models/Answer')

const router = express.Router()

// ─── Email transporter (Gmail) ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// ─── Helper: send email (non-blocking) ───────────────────────────────────────
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

  const info = await transporter.sendMail({
    from: `"Ask-Out Site 💌" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject,
    html: htmlBody,
  })

  return info
}

// ─── POST /api/answer ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { answer, dodgeCount = 0 } = req.body

  if (!answer || !['yes', 'no'].includes(answer)) {
    return res.status(400).json({ error: 'Invalid answer. Must be "yes" or "no".' })
  }

  // 1. Save to MongoDB — this must succeed before we respond
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

  // 2. Send email — respond 200 regardless so the frontend isn't blocked
  res.status(200).json({ success: true, message: `Answer "${answer}" saved.`, id: doc._id })

  // Fire-and-forget after response is sent
  try {
    console.log(`📧 Attempting email → ${process.env.EMAIL_TO} (user: ${process.env.EMAIL_USER})`)
    const info = await sendAnswerEmail(answer, dodgeCount, doc)
    console.log(`📧 Email sent! MessageId: ${info.messageId}`)
  } catch (mailErr) {
    // Log the FULL error so you can see it in Render logs
    console.error('❌ Email failed — code:', mailErr.code)
    console.error('❌ Email failed — message:', mailErr.message)
    console.error('❌ Email failed — response:', mailErr.response)
    console.error('❌ Full error:', JSON.stringify(mailErr, Object.getOwnPropertyNames(mailErr)))
  }
})

// ─── GET /api/test-email ─────────────────────────────────────────────────────
// Hit this in your browser to test email without needing the frontend:
// https://ask-out-1.onrender.com/api/test-email
router.get('/test-email', async (req, res) => {
  console.log('🧪 Test email triggered')
  console.log('   EMAIL_USER:', process.env.EMAIL_USER)
  console.log('   EMAIL_TO:', process.env.EMAIL_TO)
  console.log('   EMAIL_PASS set?', !!process.env.EMAIL_PASS, '| length:', process.env.EMAIL_PASS?.replace(/\s/g, '').length)

  try {
    // Verify credentials first
    await transporter.verify()
    console.log('✅ SMTP credentials verified OK')

    const info = await transporter.sendMail({
      from: `"Ask-Out Site 💌" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: '🧪 Test email from Ask-Out backend',
      html: '<p>If you can read this, your email setup is working! 🎉</p>',
    })

    console.log('📧 Test email sent! MessageId:', info.messageId)
    res.json({ success: true, messageId: info.messageId })
  } catch (err) {
    console.error('❌ Test email failed:', err.message, err.response)
    res.status(500).json({
      error: err.message,
      code: err.code,
      response: err.response,
    })
  }
})

module.exports = router
