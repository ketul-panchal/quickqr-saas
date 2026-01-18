import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Crown,
  QrCode,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChefHat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for charts
const scansData = [
  { name: 'Jan 1', scans: 45 },
  { name: 'Jan 5', scans: 52 },
  { name: 'Jan 10', scans: 78 },
  { name: 'Jan 15', scans: 95 },
  { name: 'Jan 20', scans: 120 },
  { name: 'Jan 25', scans: 88 },
  { name: 'Jan 30', scans: 145 },
];

const weeklyOrdersData = [
  { name: 'Mon', orders: 24 },
  { name: 'Tue', orders: 35 },
  { name: 'Wed', orders: 28 },
  { name: 'Thu', orders: 42 },
  { name: 'Fri', orders: 58 },
  { name: 'Sat', orders: 65 },
  { name: 'Sun', orders: 48 },
];

// Mock recent orders
const recentOrders = [
  {
    id: 'ORD-001',
    table: 'Table 5',
    items: 3,
    total: 45.99,
    status: 'completed',
    time: '10 min ago',
  },
  {
    id: 'ORD-002',
    table: 'Table 12',
    items: 5,
    total: 78.50,
    status: 'preparing',
    time: '15 min ago',
  },
  {
    id: 'ORD-003',
    table: 'Table 3',
    items: 2,
    total: 25.00,
    status: 'pending',
    time: '20 min ago',
  },
  {
    id: 'ORD-004',
    table: 'Table 8',
    items: 4,
    total: 62.75,
    status: 'completed',
    time: '35 min ago',
  },
  {
    id: 'ORD-005',
    table: 'Table 1',
    items: 1,
    total: 15.99,
    status: 'cancelled',
    time: '1 hour ago',
  },
];

// Mock popular items
const popularItems = [
  { name: 'Margherita Pizza', orders: 145, revenue: 1740 },
  { name: 'Pasta Carbonara', orders: 120, revenue: 1680 },
  { name: 'Caesar Salad', orders: 98, revenue: 882 },
  { name: 'Tiramisu', orders: 85, revenue: 595 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');

  // Stats cards data
  const stats = [
    {
      title: 'Total Restaurants',
      value: user?.stats?.totalRestaurants || 2,
      change: '+1 this month',
      changeType: 'positive',
      icon: Store,
      color: 'sky',
      link: '/dashboard/restaurants',
    },
    {
      title: 'Membership Plan',
      value: user?.subscription?.plan?.charAt(0).toUpperCase() + user?.subscription?.plan?.slice(1) || 'Free',
      change: user?.subscription?.status === 'trial' ? '14 days left' : 'Active',
      changeType: 'neutral',
      icon: Crown,
      color: 'amber',
      link: '/dashboard/membership',
    },
    {
      title: 'Total Scans',
      value: '2,847',
      change: '+12.5% vs last month',
      changeType: 'positive',
      icon: QrCode,
      color: 'emerald',
      link: '/dashboard/qr-codes',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2% vs last month',
      changeType: 'positive',
      icon: ShoppingBag,
      color: 'violet',
      link: '/dashboard/orders',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'preparing':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-sky-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      preparing: 'bg-amber-100 text-amber-700',
      pending: 'bg-sky-100 text-sky-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your restaurants today.
          </p>
        </div>
        <Link
          to="/dashboard/restaurants/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Restaurant</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            sky: 'bg-sky-100 text-sky-600',
            amber: 'bg-amber-100 text-amber-600',
            emerald: 'bg-emerald-100 text-emerald-600',
            violet: 'bg-violet-100 text-violet-600',
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' && (
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    )}
                    {stat.changeType === 'negative' && (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.changeType === 'positive'
                          ? 'text-emerald-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scans Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">QR Code Scans</h3>
              <p className="text-sm text-gray-500">This month&apos;s scan activity</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scansData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScans)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Orders</h3>
              <p className="text-sm text-gray-500">Orders received this week</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Total:</span>
              <span className="font-semibold text-gray-900">300 orders</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500">Latest orders from all restaurants</p>
            </div>
            <Link
              to="/dashboard/orders"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Table</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.table}</td>
                    <td className="px-6 py-4 text-gray-600">{order.items} items</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Items</h3>
              <p className="text-sm text-gray-500">Best sellers this month</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {popularItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.revenue}</p>
                  <p className="text-xs text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <h3 className="text-xl font-semibold mb-1">Need help getting started?</h3>
            <p className="text-white/80">
              Check out our guide to set up your first restaurant and start receiving orders.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/dashboard/restaurants/new"
              className="w-full sm:w-auto bg-white text-sky-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Create Restaurant
            </Link>
            <button className="w-full sm:w-auto bg-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors text-center">
              Watch Tutorial
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;