const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const organizationSettingRoutes = require('./routes/organizationSettingRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const userModulePermissionRoutes = require('./routes/userModulePermissionRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const userRoleRoutes = require('./routes/userRoleRoutes');
const roleModuleRoutes = require('./routes/roleModuleRoutes');
const headerRoutes = require('./routes/headerRoutes');
const menuRoutes = require('./routes/menuRoutes');
const auditTrailRoutes = require('./routes/auditTrailRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const carouselSlideRoutes = require('./routes/carouselSlideRoutes');
const pageRoutes = require('./routes/pageRoutes');
const footerRoutes = require('./routes/footerRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const courseModuleRoutes = require('./routes/courseModuleRoutes');
const unitRoutes = require('./routes/unitRoutes');
const unitFileRoutes = require('./routes/unitFileRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const newsCommentRoutes = require('./routes/newsCommentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes');
const auditMiddleware = require('./middlewares/auditMiddleware');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Optimized General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50000 : 5000, // Generous capacity for SPA navigation & testing
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/health' || req.path.startsWith('/media'),
  message: { success: false, error: 'Too many requests, please try again in a few minutes.' }
});
app.use(generalLimiter);

// Specific Auth Limiter for Login/Register brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' }
});

app.use(express.json());

// Automated Audit Logging Middleware
app.use(auditMiddleware);

// Serve static media files from src/media
app.use('/media', express.static(path.join(__dirname, 'media')));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/organization-settings', organizationSettingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/user-module-permissions', userModulePermissionRoutes);
app.use('/api/user-profiles', userProfileRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/role-modules', roleModuleRoutes);
app.use('/api/headers', headerRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/audit-trails', auditTrailRoutes);
app.use('/api/carousels', carouselRoutes);
app.use('/api/carousel-slides', carouselSlideRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/footers', footerRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-modules', courseModuleRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/unit-files', unitFileRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/news-comments', newsCommentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/event-registrations', eventRegistrationRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
