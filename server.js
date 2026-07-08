/**
 * TCCFlow Server for Hostinger
 * Wraps Netlify Functions as Express endpoints
 * Run: node server.js
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Block direct access to sensitive files BEFORE serving static content.
// Without this, express.static would expose .env, SQL schema/RLS files,
// backend source, and git internals over HTTP.
// ─────────────────────────────────────────────────────────────────────────────
const BLOCKED_PATTERNS = [
  /(^|\/)\.env/i,           // .env, .env-hostinger-example
  /(^|\/)\.git(\/|$)/i,     // .git internals
  /\.sql$/i,                // database schema / RLS policies
  /(^|\/)netlify(\/|$)/i,   // backend function source
  /(^|\/)server\.js$/i,
  /(^|\/)db\.js$/i,
  /(^|\/)package(-.*)?\.json$/i,
  /(^|\/)package-lock\.json$/i,
  /\.md$/i,                 // internal guides (MIGRATION_GUIDE, etc.)
  /(^|\/)\.htaccess/i
];

app.use((req, res, next) => {
  const decoded = decodeURIComponent(req.path);
  if (BLOCKED_PATTERNS.some(re => re.test(decoded))) {
    return res.status(404).send('Not found');
  }
  next();
});

// Serve static files from project root
app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny'
}));

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES — Map Netlify Functions to Express endpoints
// ─────────────────────────────────────────────────────────────────────────────

// Helper to wrap Netlify functions as Express handlers
function wrapFunction(handler) {
  return async (req, res) => {
    try {
      const event = {
        httpMethod: req.method,
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
        headers: req.headers,
        queryStringParameters: req.query,
        rawQuery: req.originalUrl.split('?')[1] || '',
      };

      const result = await handler(event);

      res.status(result.statusCode || 200);
      Object.entries(result.headers || {}).forEach(([key, value]) => {
        res.set(key, value);
      });
      res.send(result.body);
    } catch (error) {
      console.error('Function error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

// Import Netlify Functions
const validateCouponFn = require('./netlify/functions/validate-coupon');
const activateProCouponFn = require('./netlify/functions/activate-pro-coupon');
const createPreferenceFn = require('./netlify/functions/create-preference');
const createPreapprovalFn = require('./netlify/functions/create-preapproval');
const mpWebhookFn = require('./netlify/functions/mp-webhook');
const tccflowAiFn = require('./netlify/functions/tccflow-ai');

// Routes
app.post('/api/validate-coupon', wrapFunction(validateCouponFn.handler));
app.post('/api/activate-pro-coupon', wrapFunction(activateProCouponFn.handler));
app.post('/api/create-preference', wrapFunction(createPreferenceFn.handler));
app.post('/api/create-preapproval', wrapFunction(createPreapprovalFn.handler));
app.post('/api/mp-webhook', wrapFunction(mpWebhookFn.handler));
app.post('/api/tccflow-ai', wrapFunction(tccflowAiFn.handler));

// Legacy Netlify-style routes (for backwards compatibility)
app.post('/.netlify/functions/validate-coupon', (req, res) => res.redirect(307, '/api/validate-coupon'));
app.post('/.netlify/functions/activate-pro-coupon', (req, res) => res.redirect(307, '/api/activate-pro-coupon'));
app.post('/.netlify/functions/create-preference', (req, res) => res.redirect(307, '/api/create-preference'));
app.post('/.netlify/functions/create-preapproval', (req, res) => res.redirect(307, '/api/create-preapproval'));
app.post('/.netlify/functions/mp-webhook', (req, res) => res.redirect(307, '/api/mp-webhook'));
app.post('/.netlify/functions/tccflow-ai', (req, res) => res.redirect(307, '/api/tccflow-ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    // Serve index.html for SPA routes
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TCCFlow server running on port ${PORT}`);
  console.log(`📍 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`🌐 Static site available at http://localhost:${PORT}`);
});

module.exports = app;
