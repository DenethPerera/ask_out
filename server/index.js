require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const answerRouter = require('./routes/answer')

const app = express()
const PORT = process.env.PORT || 3001

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    // Allow Vite dev server locally + any Vercel/custom domain in production
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true)
      // Allow localhost dev + any https origin (covers Vercel deployments)
      if (origin.startsWith('http://localhost') || origin.startsWith('https://')) {
        return callback(null, true)
      }
      callback(new Error('Not allowed by CORS'))
    },
    methods: ['POST', 'GET', 'OPTIONS'],
  })
)
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/answer', answerRouter)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ─── MongoDB + Start ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🍃 Connected to MongoDB:', process.env.MONGO_URI)
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
      console.log(`   POST http://localhost:${PORT}/api/answer`)
      console.log(`   GET  http://localhost:${PORT}/api/health`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
