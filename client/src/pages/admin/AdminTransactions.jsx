import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Receipt,
    Filter,
    RefreshCw,
    Printer,
    ChevronLeft,
    ChevronRight,
    Search,
    Store
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import dayjs from 'dayjs';
import InvoiceModal from '../dashboard/components/InvoiceModal';

const AdminTransactions = () => {
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [stats, setStats] = useState([]);
    
    // States for fetching and interactions
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters and Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [restaurantFilter, setRestaurantFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // Initial load for restaurants filter
    useEffect(() => {
        fetchRestaurants();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchRestaurants = async () => {
        try {
            // Passing large limit just to populate the filter dropdown
            const res = await adminApi.getRestaurants({ limit: 100 });
            setRestaurants(res.data.restaurants || []);
        } catch (error) {
            console.error('Failed to fetch restaurants:', error);
        }
    };

    const fetchOrders = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await adminApi.getOrders({
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch,
                status: statusFilter,
                restaurantId: restaurantFilter,
            });

            setOrders(res.data.orders);
            setStats(res.data.stats || []);
            setPagination(prev => ({
                ...prev,
                page: res.data.pagination.currentPage,
                limit: res.data.pagination.itemsPerPage,
                total: res.data.pagination.totalItems,
                pages: res.data.pagination.totalPages,
            }));
        } catch (error) {
            toast.error(error.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, restaurantFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Calculate total revenue from stats
    const totalPlatformRevenue = stats.reduce((acc, stat) => acc + (stat.total || 0), 0);

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
            {/* Header & Stats Container */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                <Receipt className="w-8 h-8 text-indigo-400" />
                                Platform Transactions
                            </h1>
                            <p className="text-indigo-200/80 text-lg max-w-2xl">
                                Complete financial ledger of all orders across the SaaS platform.
                            </p>
                        </div>
                        
                        {/* Financial Stat Card */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[200px]">
                            <p className="text-indigo-200 text-sm font-medium mb-1">Total Platform Revenue (Filtered)</p>
                            <p className="text-3xl font-bold text-white">${totalPlatformRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order number or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors flex-1 md:flex-none justify-center ${
                                showFilters || statusFilter !== 'all' || restaurantFilter !== 'all'
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
                            <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="served">Served</option>
                                        <option value="completed">Completed (Paid)</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant</label>
                                    <select
                                        value={restaurantFilter}
                                        onChange={(e) => {
                                            setRestaurantFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900"
                                    >
                                        <option value="all">All Restaurants</option>
                                        {restaurants.map(r => (
                                            <option key={r._id} value={r._id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Reference</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Restaurant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Receipt className="w-8 h-8 opacity-50" />
                                            <p>No transactions found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{dayjs(order.createdAt).format('MMM D, YYYY')}</span>
                                                <span className="text-xs text-gray-500">{dayjs(order.createdAt).format('h:mm A')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900 block">{order.orderNumber}</span>
                                            <span className="text-xs text-gray-500">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">{order.restaurant?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 block">{order.customerName}</span>
                                            <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ${(order.total || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowInvoiceModal(true);
                                                }}
                                                className="inline-flex items-center gap-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View & Print Invoice"
                                            >
                                                <Printer className="w-4 h-4" />
                                                <span className="text-sm font-medium hidden sm:inline-block">Invoice</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-gray-700 px-3 text-sm font-medium">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            <AnimatePresence>
                {showInvoiceModal && selectedOrder && (
                    <InvoiceModal
                        order={selectedOrder}
                        restaurant={selectedOrder.restaurant}
                        onClose={() => setShowInvoiceModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTransactions;
