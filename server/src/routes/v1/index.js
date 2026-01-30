// import express from 'express';
// import authRoutes from './auth.routes.js';
// import userRoutes from './user.routes.js';
// import restaurantRoutes from './restaurant.routes.js';
// import onboardingRoutes from './onboarding.routes.js';

// const router = express.Router();

// // Health check
// router.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'API is running',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // API routes
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/restaurants', restaurantRoutes);
// router.use('/onboarding', onboardingRoutes);

// export default router;

import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import menuRoutes from './menu.routes.js';
import publicMenuRoutes from './publicMenu.routes.js';
import orderRoutes from './order.routes.js';
import tableRoutes from './table.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/restaurants/:restaurantId/menu', menuRoutes);
router.use('/restaurants/:restaurantId/orders', orderRoutes);
router.use('/restaurants/:restaurantId/tables', tableRoutes);
router.use('/menu', publicMenuRoutes);
router.use('/orders', orderRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

export default router;