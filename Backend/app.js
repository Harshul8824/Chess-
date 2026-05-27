import express          from 'express';
import cors             from 'cors';
import helmet           from 'helmet';
import compression      from 'compression';
import cookieParser     from 'cookie-parser';
import morgan           from 'morgan';
import rateLimit        from 'express-rate-limit';
import mongoSanitize    from 'express-mongo-sanitize';
import xss              from 'xss-clean';
import hpp              from 'hpp';
import path             from 'path';
import { fileURLToPath } from 'url';

// ─── Routes ───────────────────────────────────────
import authRoutes       from './Routes/authRoutes.js';
import gameRoutes       from './Routes/gameRoutes.js';
import userRoutes       from './Routes/userRoutes.js';

// ─── Middleware ────────────────────────────────────
import { errorHandler } from './middleware/errorHandler.js';
import { notFound }     from './middleware/notFound.js';

// ─── __dirname fix for ES Modules ─────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ════════════════════════════════════════════════════
//  1. SECURITY HEADERS
// ════════════════════════════════════════════════════
app.use(helmet());                        // sets 14 security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// ════════════════════════════════════════════════════
//  2. COMPRESSION
// ════════════════════════════════════════════════════
app.use(compression({
  level: 6,                               // compression level (1-9)
  threshold: 1024,                        // only compress if > 1KB
}));

// ════════════════════════════════════════════════════
//  3. CORS
// ════════════════════════════════════════════════════
const allowedOrigins = [
  'http://localhost:5173',                // Vite dev server
  'http://localhost:3000',               // CRA dev server
  process.env.CLIENT_URL,               // production frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    // allow Postman & server-to-server (no origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,                     // allow cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ════════════════════════════════════════════════════
//  4. RATE LIMITING
// ════════════════════════════════════════════════════

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,             // 15 minutes
  max: 100,                             // 100 requests per window
  message: { success: false, message: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                              // only 10 login attempts per 15 min
  message: { success: false, message: 'Too many login attempts, try again later.' },
});

app.use('/api',        apiLimiter);
app.use('/api/auth',   authLimiter);

// ════════════════════════════════════════════════════
//  5. BODY PARSERS
// ════════════════════════════════════════════════════
app.use(express.json({ limit: '10kb' }));          // block large JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ════════════════════════════════════════════════════
//  6. DATA SANITIZATION
// ════════════════════════════════════════════════════
app.use(mongoSanitize());    // prevent NoSQL injection  e.g. { "$gt": "" }
app.use(xss());              // prevent XSS attacks      e.g. <script>alert(1)</script>
app.use(hpp());              // prevent HTTP param pollution e.g. ?sort=asc&sort=desc

// ════════════════════════════════════════════════════
//  7. LOGGING
// ════════════════════════════════════════════════════
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));                // colorful logs in dev
} else {
  app.use(morgan('combined'));          // standard Apache log format in prod
}

// ════════════════════════════════════════════════════
//  8. STATIC FILES
// ════════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',                         // cache static files for 1 day
  etag: true,
}));

// ════════════════════════════════════════════════════
//  9. HEALTH CHECK
// ════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status:  'Chess server is running ♟️',
    env:     process.env.NODE_ENV,
    uptime:  `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════════════════
//  10. API ROUTES
// ════════════════════════════════════════════════════
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/games', gameRoutes);

// ════════════════════════════════════════════════════
//  11. UNHANDLED ROUTES
// ════════════════════════════════════════════════════
app.use(notFound);

// ════════════════════════════════════════════════════
//  12. GLOBAL ERROR HANDLER — always last
// ════════════════════════════════════════════════════
app.use(errorHandler);

export default app;