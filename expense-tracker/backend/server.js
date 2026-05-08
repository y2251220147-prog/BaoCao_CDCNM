require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');

// ── Import routes ──────────────────────────────────────────────────────────────
const transactionRoutes = require('./routes/transactions');
const categoryRoutes    = require('./routes/categories');
const budgetRoutes      = require('./routes/budgets');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ── Health-check endpoint (REQUIRED for DevOps) ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    ok:        true,
    status:    'ok',
    timestamp: new Date().toISOString(),
    service:   'expense-tracker-api',
    version:   '1.0.0',
  });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/budgets',      budgetRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy đường dẫn' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`🩺  Health check: http://localhost:${PORT}/api/health`);
});
