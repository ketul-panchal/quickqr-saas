import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChefHat,
  Utensils,
  Package,
  User,
  Hash,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  MoreVertical,
  Eye,
  Loader2,
  TrendingUp,
  ShoppingBag,
  Timer,
  X,
  Check,
  Play,
  Bell,
  Volume2,
  VolumeX,
  FileText,
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';
import { orderApi } from '../../api/order.api';
import InvoiceModal from './components/InvoiceModal';

// Status configuration
const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
    nextStatus: 'confirmed',
    nextLabel: 'Confirm Order',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: CheckCircle,
    nextStatus: 'preparing',
    nextLabel: 'Start Preparing',
  },
  preparing: {
    label: 'Preparing',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: ChefHat,
    nextStatus: 'ready',
    nextLabel: 'Mark Ready',
  },
  ready: {
    label: 'Ready',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: Package,
    nextStatus: 'served',
    nextLabel: 'Mark Served',
  },
  served: {
    label: 'Served',
    color: 'sky',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    icon: Utensils,
    nextStatus: 'completed',
    nextLabel: 'Complete Order',
  },
  completed: {
    label: 'Completed',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: CheckCircle,
    nextStatus: null,
    nextLabel: null,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: XCircle,
    nextStatus: null,
    nextLabel: null,
  },
};

const OrderManagement = ({ restaurantId: propRestaurantId }) => {
  const { id: paramRestaurantId } = useParams();
  const restaurantId = propRestaurantId || paramRestaurantId;
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch data
  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [restaurantRes, ordersRes, summaryRes] = await Promise.all([
        restaurantApi.getRestaurant(restaurantId),
        orderApi.getOrders(restaurantId, { status: statusFilter !== 'all' ? statusFilter : undefined }),
        orderApi.getSummary(restaurantId),
      ]);

      setRestaurant(restaurantRes.data);
      setOrders(ordersRes.data.orders || []);
      setSummary(summaryRes.data);
    } catch (error) {
      // Only show error if we have a restaurantId to attempt fetching
      if (restaurantId) {
        toast.error('Failed to load orders');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [restaurantId, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, estimatedTime = null) => {
    try {
      await orderApi.updateStatus(restaurantId, orderId, {
        status: newStatus,
        estimatedTime,
      });

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus, estimatedTime } : order
        )
      );

      // Update selected order if open
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus, estimatedTime }));
      }

      toast.success(`Order ${newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully`);

      // Refresh summary
      const summaryRes = await orderApi.getSummary(restaurantId);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  // Cancel order
  const cancelOrder = async (orderId, reason = '') => {
    try {
      await orderApi.updateStatus(restaurantId, orderId, {
        status: 'cancelled',
        cancelReason: reason,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 'cancelled' }));
      }

      toast.success('Order cancelled');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Group orders by status for tabs count
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Please select a restaurant to view orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {!propRestaurantId && (
            <button
              onClick={() => navigate('/dashboard/restaurants')}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Restaurants</span>
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Order Management
          </h1>
          <p className="text-gray-500 mt-1">{restaurant?.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${soundEnabled
              ? 'border-sky-200 bg-sky-50 text-sky-600'
              : 'border-gray-200 bg-white text-gray-400'
              }`}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchData(false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Today's Orders"
          value={summary?.totalOrders || 0}
          icon={ShoppingBag}
          color="sky"
        />
        <SummaryCard
          title="Revenue"
          value={`$${(summary?.totalRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <SummaryCard
          title="Pending"
          value={summary?.pendingOrders || 0}
          icon={Clock}
          color="amber"
          highlight={summary?.pendingOrders > 0}
        />
        <SummaryCard
          title="Completed"
          value={summary?.completedOrders || 0}
          icon={CheckCircle}
          color="gray"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, or table..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            <StatusTab
              label="All"
              count={orders.length}
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <StatusTab
              label="Pending"
              count={orderCounts.pending || 0}
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
              color="amber"
            />
            <StatusTab
              label="Preparing"
              count={orderCounts.preparing || 0}
              active={statusFilter === 'preparing'}
              onClick={() => setStatusFilter('preparing')}
              color="purple"
            />
            <StatusTab
              label="Ready"
              count={orderCounts.ready || 0}
              active={statusFilter === 'ready'}
              onClick={() => setStatusFilter('ready')}
              color="emerald"
            />
            <StatusTab
              label="Completed"
              count={orderCounts.completed || 0}
              active={statusFilter === 'completed'}
              onClick={() => setStatusFilter('completed')}
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all'
                ? `No ${statusFilter} orders at the moment`
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onView={() => setSelectedOrder(order)}
                onViewInvoice={() => setShowInvoice(order)}
                onUpdateStatus={updateOrderStatus}
                onCancel={cancelOrder}
                formatTime={formatTime}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={updateOrderStatus}
        onCancel={cancelOrder}
        formatTime={formatTime}
        formatDate={formatDate}
      />

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal
          order={showInvoice}
          restaurant={restaurant}
          onClose={() => setShowInvoice(null)}
        />
      )}
    </div>
  );
};

// ==================== COMPONENTS ====================

// Summary Card
const SummaryCard = ({ title, value, icon: Icon, color, highlight }) => {
  const colorClasses = {
    sky: 'bg-sky-100 text-sky-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border p-5 ${highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {highlight && (
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

// Status Tab
const StatusTab = ({ label, count, active, onClick, color = 'sky' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${active
        ? 'bg-sky-500 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// Order Card
const OrderCard = ({ order, onView, onViewInvoice, onUpdateStatus, onCancel, formatTime, getTimeAgo }) => {
  const [showActions, setShowActions] = useState(false);
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${order.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
        }`}
    >
      {/* Pending Order Highlight Bar */}
      {order.status === 'pending' && (
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
      )}

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {/* Order Number */}
              <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
              >
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>

              {/* Time */}
              <span className="text-sm text-gray-500 hidden sm:inline">
                {getTimeAgo(order.createdAt)}
              </span>
            </div>

            {/* Customer & Table */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                {order.customerName}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-400" />
                {order.tableNumber}
              </span>
              {order.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5 sm:hidden">
                <Clock className="w-4 h-4 text-gray-400" />
                {getTimeAgo(order.createdAt)}
              </span>
            </div>

            {/* Items Preview */}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                >
                  {item.quantity}× {item.name}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-lg text-sm text-gray-500">
                  +{order.items.length - 3} more
                </span>
              )}
            </div>

            {/* Message */}
            {order.message && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{order.message}</p>
              </div>
            )}
          </div>

          {/* Total & Actions */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* View Details */}
              <button
                onClick={onView}
                className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>

              {/* View Invoice */}
              <button
                onClick={onViewInvoice}
                className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-colors"
                title="View Invoice"
              >
                <FileText className="w-5 h-5" />
              </button>

              {/* Next Status Action */}
              {config.nextStatus && (
                <button
                  onClick={() => onUpdateStatus(order._id, config.nextStatus)}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.nextLabel}</span>
                </button>
              )}

              {/* More Actions */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {showActions && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowActions(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                        >
                          <button
                            onClick={() => {
                              onCancel(order._id);
                              setShowActions(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, onClose, onUpdateStatus, onCancel, formatTime, formatDate }) => {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (!order) return null;

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const handleCancel = () => {
    onCancel(order._id, cancelReason);
    setShowCancelForm(false);
    setCancelReason('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
              >
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </div>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Hash className="w-4 h-4" />
                  <span>Table</span>
                </div>
                <p className="font-semibold text-gray-900">{order.tableNumber}</p>
              </div>
              {order.phone && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Phone className="w-4 h-4" />
                    <span>Phone</span>
                  </div>
                  <p className="font-semibold text-gray-900">{order.phone}</p>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            {order.message && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 text-sm mb-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Special Instructions</span>
                </div>
                <p className="text-amber-800">{order.message}</p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-amber-600 mt-1">Note: {item.notes}</p>
                      )}
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Cancel Form */}
            {showCancelForm && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-medium text-red-800 mb-3">Cancel Order</h4>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation (optional)"
                  className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-white rounded-xl transition-colors"
                  >
                    Nevermind
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Cancel Button */}
                {!showCancelForm && (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {/* Status Update Buttons */}
                {config.nextStatus && !showCancelForm && (
                  <button
                    onClick={() => onUpdateStatus(order._id, config.nextStatus)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span>{config.nextLabel}</span>
                  </button>
                )}
              </div>

              {/* Status Flow */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <span>Status Flow:</span>
                <span className="flex items-center gap-1">
                  {['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'].map(
                    (status, index, arr) => (
                      <span key={status} className="flex items-center">
                        <span
                          className={`px-2 py-0.5 rounded ${order.status === status
                            ? 'bg-sky-100 text-sky-700 font-medium'
                            : 'text-gray-400'
                            }`}
                        >
                          {statusConfig[status].label}
                        </span>
                        {index < arr.length - 1 && <span className="text-gray-300 mx-1">→</span>}
                      </span>
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderManagement;