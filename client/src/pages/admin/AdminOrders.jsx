import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    ShoppingBag,
    Search,
    Filter,
    RefreshCw,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    Store,
    Printer
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import dayjs from 'dayjs';
import InvoiceModal from '../dashboard/components/InvoiceModal';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters and Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [restaurantFilter, setRestaurantFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusUpdateLoader, setStatusUpdateLoader] = useState(false);

    // Fetch filters data (restaurants)
    const fetchRestaurants = async () => {
        try {
            const res = await adminApi.getRestaurants({ limit: 100, status: 'active' });
            setRestaurants(res.data.restaurants || []);
        } catch (error) {
            console.error('Failed to fetch restaurants for filter', error);
        }
    };

    const fetchOrders = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await adminApi.getOrders({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter,
                restaurantId: restaurantFilter,
            });
            setOrders(res.data.orders);
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch (error) {
            toast.error(error.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter, restaurantFilter]);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await adminApi.deleteOrder(orderId);
            toast.success('Order deleted successfully');
            setDeleteConfirm(null);
            fetchOrders(true);
        } catch (error) {
            toast.error(error.message || 'Failed to delete order');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setStatusUpdateLoader(true);
        try {
            await adminApi.updateOrderStatus(orderId, { status: newStatus });
            toast.success(`Order marked as ${newStatus}`);
            
            // Update local state if modal is open
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
            fetchOrders(true);
        } catch (error) {
            toast.error(error.message || 'Failed to update order status');
        } finally {
            setStatusUpdateLoader(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            preparing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            ready: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            served: 'bg-green-500/10 text-green-500 border-green-500/20',
            completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        const style = styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        Order Management
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage all platform orders</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order number, customer, or table..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </form>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing}
                            className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-gray-400 hover:text-white hover:border-slate-600 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                                showFilters || statusFilter || restaurantFilter
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-900 border-slate-700 text-gray-400 hover:text-white'
                            }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-700">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Restaurant</label>
                                    <select
                                        value={restaurantFilter}
                                        onChange={(e) => {
                                            setRestaurantFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="">All Restaurants</option>
                                        {restaurants.map(r => (
                                            <option key={r._id} value={r._id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="served">Served</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('');
                                            setRestaurantFilter('');
                                            setSearch('');
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Restaurant</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag className="w-8 h-8 opacity-50" />
                                            <p>No orders found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-medium text-white block">{order.orderNumber}</span>
                                            <span className="text-gray-400 text-xs">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Store className="w-4 h-4 text-gray-500" />
                                                <span className="truncate max-w-[150px]">{order.restaurant?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="text-white block">{order.customerName}</span>
                                            <span className="text-gray-400 text-xs">Table {order.tableNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            ${(order.total || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                                            <div className="flex flex-col text-xs">
                                                <span>{dayjs(order.createdAt).format('MMM D, YYYY')}</span>
                                                <span>{dayjs(order.createdAt).format('h:mm A')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowInvoiceModal(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-sky-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(order)}
                                                    className="p-2 text-gray-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                        <p className="text-sm text-gray-400">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-white px-3 text-sm">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {showDetailsModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-xl w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        Order Details
                                        {getStatusBadge(selectedOrder.status)}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedOrder.orderNumber} • {dayjs(selectedOrder.createdAt).format('MMMM D, YYYY h:mm A')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 text-gray-400 hover:text-white bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto hidden-scrollbar flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-medium text-gray-400 mb-1">Customer</h3>
                                        <p className="text-white font-medium">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-gray-500">Table: {selectedOrder.tableNumber}</p>
                                        {selectedOrder.phone && (
                                            <p className="text-sm text-gray-500 mt-1">Phone: {selectedOrder.phone}</p>
                                        )}
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-medium text-gray-400 mb-1">Restaurant</h3>
                                        <p className="text-white font-medium">{selectedOrder.restaurant?.name || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={index} className="flex items-start justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                                                <div>
                                                    <p className="text-white font-medium flex items-center gap-2">
                                                        <span className="text-emerald-500">{item.quantity}x</span>
                                                        {item.name}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-sm text-gray-400 mt-1 italic">Note: {item.notes}</p>
                                                    )}
                                                </div>
                                                <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-4 flex flex-col items-end">
                                    <div className="flex items-center justify-between w-64 mb-2">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-white font-medium">${(selectedOrder.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-64 mb-3 pb-3 border-b border-slate-700">
                                        <span className="text-gray-400">Tax</span>
                                        <span className="text-white font-medium">${(selectedOrder.tax || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-64">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-xl font-bold text-emerald-500">${(selectedOrder.total || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Order Status Update Area */}
                                <div className="border-t border-slate-700 pt-4">
                                     <h3 className="text-lg font-semibold text-white mb-3">Update Status</h3>
                                     <div className="flex flex-wrap gap-2">
                                        {['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map(status => (
                                            <button
                                                key={status}
                                                disabled={statusUpdateLoader || selectedOrder.status === status}
                                                onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedOrder.status === status
                                                        ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30'
                                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-transparent'
                                                }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Trash2 className="w-6 h-6 text-red-500" />
                                Delete Order
                            </h3>
                            <p className="text-gray-400 mb-6 mt-4">
                                Are you sure you want to delete order{' '}
                                <span className="text-white font-medium">{deleteConfirm.orderNumber}</span>?
                                This action cannot be undone and will completely remove the order record.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteOrder(deleteConfirm._id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invoice Modal */}
            <AnimatePresence>
                {showInvoiceModal && selectedOrder && (
                    <InvoiceModal
                        order={selectedOrder}
                        restaurant={selectedOrder.restaurant}
                        onClose={() => {
                            setShowInvoiceModal(false);
                            // Do not clear selectedOrder here as it might be needed if they quickly switch to details view, 
                            // it will be overwritten safely.
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
