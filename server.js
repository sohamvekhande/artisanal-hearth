/**
 * The Artisanal Hearth — Backend Server
 * Stack: Express · Supabase · JWT · Helmet · Rate Limiting
 */

'use strict';

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const path         = require('path');
const xss          = require('xss');
const { createClient } = require('@supabase/supabase-js');

// ─── Environment ───────────────────────────────────────────────────────────────
const PORT         = process.env.PORT || 3000;
const JWT_SECRET   = process.env.JWT_SECRET || '501d91c4e4de6507bd37825e210e118f2729c1299e849afc72c7e2043e467e301655612d4ed5eb2d10c5f7b2d091a697';
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || 'admin@artisanalhearth.in';
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH; // bcrypt hash stored in env
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

const supabase = createClient(
  process.env.SUPABASE_URL     || 'https://gmedwrqplfxknrecvzff.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZWR3cnFwbGZ4a25yZWN2emZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkwNjg1MCwiZXhwIjoyMDkxNDgyODUwfQ.iOUDNM-5T-KAelEksTJzqmQaAWGdYUB6w9tB6Dnz3w8'
);

// ─── App ────────────────────────────────────────────────────────────────────────
const app = express();

// ─── Security Headers (Helmet) ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc:     ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https://lh3.googleusercontent.com", "https://*.supabase.co"],
      connectSrc:  ["'self'"],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ───────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));   // prevent large payload DoS
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── Static Files ────────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: '1d',
}));

// ─── Rate Limiters ──────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // strict for login
  message: { error: 'Too many login attempts — try again in 15 minutes.' },
});

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Too many orders submitted — slow down.' },
});

app.use('/api/', generalLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/orders', orderLimiter);

// ─── Sanitize Utility ────────────────────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return xss(str.trim(), {
    whiteList: {},          // strip ALL HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });
}

function sanitizeObject(obj) {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    clean[k] = typeof v === 'string' ? sanitize(v) : v;
  }
  return clean;
}

// ─── JWT Middleware ──────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorisation required.' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('Forbidden');
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ─── Validation Error Helper ────────────────────────────────────────────────────
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, msg: e.msg })) });
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════════════════════════

// ── POST /api/orders ─────────────────────────────────────────────────────────────
app.post('/api/orders', [
  body('customer_name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.')
    .matches(/^[a-zA-Z\u0900-\u097F\s.'-]+$/).withMessage('Name contains invalid characters.'),
  body('phone')
    .trim().notEmpty().withMessage('Phone is required.')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number.'),
  body('address')
    .trim().notEmpty().withMessage('Address is required.')
    .isLength({ min: 5, max: 300 }).withMessage('Address must be 5–300 characters.'),
  body('items')
    .isArray({ min: 1 }).withMessage('Cart cannot be empty.'),
  body('items.*.name')
    .trim().notEmpty().withMessage('Item name required.')
    .isLength({ max: 100 }),
  body('items.*.price')
    .isFloat({ min: 0, max: 100000 }).withMessage('Invalid item price.'),
  body('items.*.qty')
    .isInt({ min: 1, max: 50 }).withMessage('Invalid quantity.'),
  body('special_instructions')
    .optional().trim().isLength({ max: 500 }).withMessage('Instructions too long.'),
], async (req, res) => {
  const err = handleValidation(req, res); if (err !== null) return;

  const safe = sanitizeObject({
    customer_name:        req.body.customer_name,
    phone:                req.body.phone,
    address:              req.body.address,
    special_instructions: req.body.special_instructions || '',
  });

  const items = req.body.items.map(i => ({
    name:  sanitize(String(i.name)),
    price: parseFloat(i.price),
    qty:   parseInt(i.qty),
  }));

  const total_amount = items.reduce((s, i) => s + i.price * i.qty, 0);

  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...safe, items, total_amount, status: 'pending' }])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase order error:', error);
    return res.status(500).json({ error: 'Failed to save order. Please try again.' });
  }

  res.status(201).json({ message: 'Order placed successfully!', order_id: data.id });
});


// ── POST /api/reservations ────────────────────────────────────────────────────────
app.post('/api/reservations', [
  body('first_name')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\u0900-\u097F\s.'-]+$/).withMessage('Invalid first name.'),
  body('last_name')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z\u0900-\u097F\s.'-]+$/).withMessage('Invalid last name.'),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('phone')
    .trim().notEmpty().withMessage('Phone is required.')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Invalid date format.')
    .custom(v => {
      const d = new Date(v);
      if (d < new Date()) throw new Error('Reservation date must be in the future.');
      return true;
    }),
  body('time')
    .notEmpty().withMessage('Time is required.')
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/).withMessage('Invalid time format.'),
  body('guests')
    .isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20.'),
  body('occasion')
    .optional().trim().isLength({ max: 100 }),
  body('honeypot')
    .custom(v => { if (v) throw new Error('Bot detected.'); return true; }),
], async (req, res) => {
  const err = handleValidation(req, res); if (err !== null) return;

  const safe = sanitizeObject({
    first_name: req.body.first_name,
    last_name:  req.body.last_name,
    email:      req.body.email,
    phone:      req.body.phone,
    date:       req.body.date,
    time:       req.body.time,
    guests:     req.body.guests,
    occasion:   req.body.occasion || '',
  });

  const { data, error } = await supabase
    .from('reservations')
    .insert([{ ...safe, status: 'confirmed' }])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase reservation error:', error);
    return res.status(500).json({ error: 'Failed to save reservation. Please try again.' });
  }

  res.status(201).json({ message: 'Reservation confirmed!', reservation_id: data.id });
});


// ── POST /api/contact ─────────────────────────────────────────────────────────────
app.post('/api/contact', [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 })
    .matches(/^[a-zA-Z\u0900-\u097F\s.'-]+$/).withMessage('Invalid name.'),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('subject')
    .trim().notEmpty().withMessage('Subject is required.')
    .isIn(['General Inquiry', 'Private Event', 'Press & Media', 'Wholesale Coffee', 'Feedback'])
    .withMessage('Invalid subject.'),
  body('message')
    .trim().notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be 10–1000 characters.'),
  body('honeypot')
    .custom(v => { if (v) throw new Error('Bot detected.'); return true; }),
], async (req, res) => {
  const err = handleValidation(req, res); if (err !== null) return;

  const safe = sanitizeObject({
    name:    req.body.name,
    email:   req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });

  const { error } = await supabase
    .from('contact_messages')
    .insert([{ ...safe, read: false }]);

  if (error) {
    console.error('Supabase contact error:', error);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }

  res.status(201).json({ message: 'Message sent! We will respond within 24 hours.' });
});


// ── POST /api/admin/login ─────────────────────────────────────────────────────────
app.post('/api/admin/login', [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const err = handleValidation(req, res); if (err !== null) return;

  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  // If no hash is set in env (first setup), use default 'admin123' for dev only
  const hashToCheck = ADMIN_PASS_HASH || '$2a$12$wepzBRg.0Y54X9eA7KUKGLef7bgHGqw7KL6I.2StFl5UMZ64NEU/ai';
  const valid = await bcrypt.compare(password, hashToCheck);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ role: 'admin', email }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expires_in: '8h' });
});


// ── GET /api/admin/orders ─────────────────────────────────────────────────────────
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const from  = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, page, limit });
});


// ── PATCH /api/admin/orders/:id ───────────────────────────────────────────────────
app.patch('/api/admin/orders/:id', requireAdmin, [
  body('status').isIn(['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status.'),
], async (req, res) => {
  const err = handleValidation(req, res); if (err !== null) return;
  const { id } = req.params;

  const { error } = await supabase
    .from('orders')
    .update({ status: req.body.status })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Order status updated.' });
});


// ── GET /api/admin/reservations ───────────────────────────────────────────────────
app.get('/api/admin/reservations', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});


// ── GET /api/admin/messages ───────────────────────────────────────────────────────
app.get('/api/admin/messages', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});


// ── PATCH /api/admin/messages/:id/read ────────────────────────────────────────────
app.patch('/api/admin/messages/:id/read', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ read: true })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Marked as read.' });
});


// ── SPA Fallback ──────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ── Global Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});


// ─── Start ────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🫙  The Artisanal Hearth server running on port ${PORT}`);
});
