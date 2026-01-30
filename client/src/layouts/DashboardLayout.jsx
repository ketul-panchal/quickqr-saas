import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import GlobalSearch from '../components/GlobalSearch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  QrCode,
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Crown,
  Plus,
  HelpCircle,
  Receipt,
  Users,
  ChevronRight,
  Check,
} from 'lucide-react';

dayjs.extend(relativeTime);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
};

const sidebarLinks = [
  {
    title: 'Main',
    links: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Restaurant Management',
    links: [
      { name: 'My Restaurants', path: '/dashboard/restaurants', icon: Store },
      { name: 'Add Restaurant', path: '/dashboard/restaurants/new', icon: Plus },
      { name: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
      //   { name: 'QR Codes', path: '/dashboard/qr-codes', icon: QrCode },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Membership', path: '/dashboard/membership', icon: Crown },
      { name: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
      { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ],
  },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get current page title
  const getCurrentPageTitle = () => {
    for (const section of sidebarLinks) {
      for (const link of section.links) {
        if (location.pathname === link.path) {
          return link.name;
        }
      }
    }
    return 'Dashboard';
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id || notification.id);
    }
    // Navigate to order if it's an order notification
    if (notification.data?.orderId && notification.data?.restaurantId) {
      navigate(`/dashboard/restaurants/${notification.data.restaurantId}/orders`);
      setNotificationsOpen(false);
    }
  };

  // Format notification time
  const formatTime = (date) => {
    return dayjs(date).fromNow();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <NavLink to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">QuickQR</span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {sidebarLinks.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;

                  return (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-sky-50 text-sky-600'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="font-medium">{link.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 bg-sky-600 rounded-full"
                          />
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Upgrade Card */}
        {user?.subscription?.plan === 'free' && (
          <div className="p-4">
            <div className="bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl p-4 text-white">
              <Crown className="w-8 h-8 mb-3" />
              <h4 className="font-semibold mb-1">Upgrade to Pro</h4>
              <p className="text-sm text-white/80 mb-3">
                Get unlimited restaurants and features
              </p>
              <button
                onClick={() => navigate('/dashboard/membership')}
                className="w-full bg-white text-sky-600 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Dashboard</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{getCurrentPageTitle()}</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:flex items-center">
                <GlobalSearch />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification._id || notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-sky-50/50' : ''
                                }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-sky-500' : 'bg-gray-300'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                  <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                          <button className="text-sm text-sky-600 font-medium hover:text-sky-700">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <NavLink
                          to="/dashboard/settings"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </NavLink>
                        <NavLink
                          to="/dashboard/membership"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Crown className="w-4 h-4" />
                          <span>Membership</span>
                        </NavLink>
                        <a
                          href="#"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </a>
                      </div>
                      <div className="py-2 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(profileDropdown || notificationsOpen) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setProfileDropdown(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;