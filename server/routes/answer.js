const express = require('express')
const nodemailer = require('nodemailer')
const Answer = require('../models/Answer')

const router = express.Router()

// ─── Email transporter (Gmail) ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Fixes "self-signed certificate in certificate chain" on Windows
    // (caused by antivirus/firewall SSL inspection)
    rejectUnauthorized: false,
  },
})

// ─── POST /api/answer ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { answer, dodgeCount = 0 } = req.body

    if (!answer || !['yes', 'no'].includes(answer)) {
      return res.status(400).json({ error: 'Invalid answer. Must be "yes" or "no".' })
    }

    // 1. Save to MongoDB
    const doc = await Answer.create({
      answer,
      dodgeCount,
      userAgent: req.headers['user-agent'] || '',
    })

    console.log(`✅ Answer saved to MongoDB: ${answer} (dodges: ${dodgeCount}) — id: ${doc._id}`)

    // 2. Send email notification
    const isYes = answer === 'yes'
    const emoji = isYes ? '💕' : '💔'
    const subject = isYes
      ? `${emoji} SHE SAID YES! 🎉`
      : `${emoji} She said no...`

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

    await transporter.sendMail({
      from: `"Ask-Out Site 💌" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject,
      html: htmlBody,
    })

    console.log(`📧 Email sent to ${process.env.EMAIL_TO} — subject: "${subject}"`)

    res.status(200).json({
      success: true,
      message: `Answer "${answer}" saved and email sent.`,
      id: doc._id,
    })
  } catch (err) {
    console.error('❌ Error in POST /api/answer:', err)
    res.status(500).json({ error: 'Internal server error', details: err.message })
  }
})

module.exports = router
